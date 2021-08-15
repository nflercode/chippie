{{- define "ingress.host" }}
{{- if .Values.pr -}}
    api.pr-{{ .Values.pr }}.mychips.online
{{- else -}}
    api.mychips.online
{{- end -}}
{{- end }}