{{- define "ingress.host" }}
{{- if .Values.pr -}}
    api.pr-{{ .Values.pr }}.nfler.se
{{- else -}}
    api.nfler.se
{{- end -}}
{{- end }}