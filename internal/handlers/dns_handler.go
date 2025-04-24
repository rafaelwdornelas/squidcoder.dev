// internal/handlers/dns_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"squidcoder/internal/dns"
)

// DNSCheckRequest representa a solicitação de verificação DNS
type DNSCheckRequest struct {
	Domain     string `json:"domain"`
	RecordType string `json:"recordType"`
}

// HandleDNSCheck gerencia requisições de verificação DNS
func HandleDNSCheck(w http.ResponseWriter, r *http.Request) {
	// Apenas aceitar POST
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	// Decodificar a requisição
	var req DNSCheckRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Erro ao decodificar JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validar o domínio
	if req.Domain == "" {
		http.Error(w, "Domínio não pode estar vazio", http.StatusBadRequest)
		return
	}

	// Remover "http://" ou "https://" se estiver presente
	req.Domain = strings.TrimPrefix(req.Domain, "http://")
	req.Domain = strings.TrimPrefix(req.Domain, "https://")

	// Remover qualquer caminho após o domínio
	if i := strings.Index(req.Domain, "/"); i > 0 {
		req.Domain = req.Domain[:i]
	}

	// Validar o tipo de registro
	validTypes := map[string]bool{
		"A":     true,
		"AAAA":  true,
		"MX":    true,
		"NS":    true,
		"TXT":   true,
		"CNAME": true,
		"SOA":   true,
		"PTR":   true,
		"SRV":   true,
	}

	if !validTypes[req.RecordType] {
		http.Error(w, "Tipo de registro inválido", http.StatusBadRequest)
		return
	}

	// Realizar a verificação DNS
	results := dns.CheckDNS(req.Domain, req.RecordType)

	// Retornar os resultados
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// GetDNSServers retorna a lista de servidores DNS disponíveis
func GetDNSServers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dns.DNSServers)
}
