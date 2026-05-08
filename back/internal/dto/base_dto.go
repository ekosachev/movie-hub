package dto

type APIResponse struct {
	Success bool   `json:"success"`
	Data    any    `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

type PaginatedResponse struct {
	Count  uint `json:"count"`
	Offset uint `json:"offset"`
	Items  any  `json:"items"`
}
