// internal/dns/checker.go
package dns

import (
	"context"
	"fmt"
	"net"
	"sync"
	"time"
)

// Servidor DNS representa um servidor para consulta
type DNSServer struct {
	Name     string `json:"name"`
	Location string `json:"location"`
	IP       string `json:"ip"`
	Provider string `json:"provider"`
}

// Resultado de uma consulta DNS
type DNSResult struct {
	Server     DNSServer `json:"server"`
	Records    []string  `json:"records"`
	TTL        int       `json:"ttl"`
	Status     string    `json:"status"`
	ResponseMs int64     `json:"response_ms"`
	Timestamp  time.Time `json:"timestamp"`
	Error      string    `json:"error,omitempty"`
}

// Lista de servidores DNS conhecidos
// Lista de servidores DNS extraídos
var DNSServers = []DNSServer{
	{Name: "Google DNS", Location: "Mountain View CA, United States", IP: "8.8.8.8", Provider: "Google"},
	{Name: "Quad9", Location: "Berkeley, US", IP: "9.9.9.9", Provider: "Quad9"},
	{Name: "OpenDNS", Location: "San Francisco CA, United States", IP: "208.67.222.220", Provider: "OpenDNS"},
	{Name: "WholeSale Internet", Location: "Kansas City, United States", IP: "204.12.225.227", Provider: "WholeSale Internet, Inc."},
	{Name: "CenturyLink", Location: "United States", IP: "205.171.202.66", Provider: "CenturyLink"},
	{Name: "NeuStar", Location: "Ashburn, United States", IP: "156.154.70.64", Provider: "NeuStar"},
	{Name: "Corporate West", Location: "San Jose, United States", IP: "66.206.166.2", Provider: "Corporate West Computer Systems"},
	{Name: "Fortinet", Location: "Burnaby, Canada", IP: "208.91.112.53", Provider: "Fortinet Inc"},
	{Name: "Skydns", Location: "Yekaterinburg, Russian Federation", IP: "195.46.39.39", Provider: "Skydns"},
	{Name: "Liquid Telecommunications", Location: "Cullinan, South Africa", IP: "5.11.11.5", Provider: "Liquid Telecommunications Ltd"},
	{Name: "OpenTLD", Location: "Amsterdam, Netherlands", IP: "80.80.80.80", Provider: "OpenTLD BV"},
	{Name: "Online S.A.S.", Location: "Paris, France", IP: "163.172.107.158", Provider: "Online S.A.S."},
	{Name: "Prioritytelecom", Location: "Madrid, Spain", IP: "212.230.255.1", Provider: "Prioritytelecom Spain S.A."},
	{Name: "nemox.net", Location: "Innsbruck, Austria", IP: "83.137.41.9", Provider: "nemox.net"},
	{Name: "Verizon Deutschland", Location: "Oberhausen, Germany", IP: "194.172.160.4", Provider: "Verizon Deutschland GmbH"},
	{Name: "Marcatel Com", Location: "Monterrey, Mexico", IP: "200.56.224.11", Provider: "Marcatel Com"},
	{Name: "Claro S.A", Location: "Santa Cruz do Sul, Brazil", IP: "200.248.178.54", Provider: "Claro S.A"},
	{Name: "Cloudflare", Location: "Research, Australia", IP: "1.1.1.1", Provider: "Cloudflare Inc"},
	{Name: "Pacific Internet", Location: "Melbourne, Australia", IP: "61.8.0.113", Provider: "Pacific Internet"},
	{Name: "Global-Gateway", Location: "Auckland, New Zealand", IP: "122.56.107.86", Provider: "Global-Gateway Internet"},
	{Name: "DigitalOcean", Location: "Singapore", IP: "139.59.219.245", Provider: "DigitalOcean LLC"},
	{Name: "LG Dacom", Location: "Seoul, South Korea", IP: "164.124.101.2", Provider: "LG Dacom Corporation"},
	{Name: "Baidu", Location: "Beijing, China", IP: "180.76.76.76", Provider: "Baidu Netcom Science & Tech Co."},
	{Name: "Kappa Internet", Location: "Kota, India", IP: "115.178.96.2", Provider: "Kappa Internet Services Private Limited"},
	{Name: "CMPak", Location: "Islamabad, Pakistan", IP: "209.150.154.1", Provider: "CMPak Limited"},
	{Name: "Daniel Cid", Location: "Ireland", IP: "185.228.168.9", Provider: "Daniel Cid"},
	{Name: "SS Online", Location: "Dhaka, Bangladesh", IP: "103.80.1.2", Provider: "SS Online"},
}

// CheckDNS faz consultas DNS para o domínio e tipo especificados em todos os servidores conhecidos
func CheckDNS(domain string, recordType string) []DNSResult {
	var wg sync.WaitGroup
	results := make([]DNSResult, len(DNSServers))

	for i, server := range DNSServers {
		wg.Add(1)
		go func(index int, srv DNSServer) {
			defer wg.Done()

			results[index] = queryDNS(domain, recordType, srv)
		}(i, server)
	}

	wg.Wait()
	return results
}

// queryDNS faz a consulta real para um servidor específico
func queryDNS(domain string, recordType string, server DNSServer) DNSResult {
	start := time.Now()
	result := DNSResult{
		Server:    server,
		Timestamp: time.Now(),
	}

	// Configurar um resolver personalizado
	r := &net.Resolver{
		PreferGo: true,
		Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
			d := net.Dialer{
				Timeout: time.Second * 5,
			}
			return d.DialContext(ctx, "udp", server.IP+":53")
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var records []string
	var ttl int
	var err error

	// Fazer a consulta baseada no tipo de registro
	switch recordType {
	case "A":
		ips, err := r.LookupIP(ctx, "ip4", domain)
		if err == nil {
			for _, ip := range ips {
				records = append(records, ip.String())
			}
		}
	case "AAAA":
		ips, err := r.LookupIP(ctx, "ip6", domain)
		if err == nil {
			for _, ip := range ips {
				records = append(records, ip.String())
			}
		}
	case "MX":
		mxs, err := r.LookupMX(ctx, domain)
		if err == nil {
			for _, mx := range mxs {
				records = append(records, fmt.Sprintf("%s %d", mx.Host, mx.Pref))
			}
		}
	case "NS":
		nss, err := r.LookupNS(ctx, domain)
		if err == nil {
			for _, ns := range nss {
				records = append(records, ns.Host)
			}
		}
	case "TXT":
		txts, err := r.LookupTXT(ctx, domain)
		if err == nil {
			records = txts
		}
	default:
		err = fmt.Errorf("tipo de registro não suportado: %s", recordType)
	}

	// Calcular tempo de resposta
	responseTime := time.Since(start)
	result.ResponseMs = responseTime.Milliseconds()

	// Preencher resultados
	if err != nil {
		result.Status = "error"
		result.Error = err.Error()
	} else if len(records) == 0 {
		result.Status = "no_record"
	} else {
		result.Status = "success"
		result.Records = records
		result.TTL = ttl // Nota: obter TTL requer implementação mais complexa com miekg/dns
	}

	return result
}
