# The CRASH course on Helm Templating - Advanced Topics

## Prerequisites
Complete "The CRASH course on Helm Templating - The Basics" at this link: https://dsext001-eu1-215dsi0708-3dswym.3dexperience.3ds.com/me/profile?content=swym:215dsi0708:DSEXT001:communitypost:E5otr3t8SES3YwP-LRcGoQ

## Helm - Named Templates
Named templates (sometimes called "partials" or "subtemplates") are templates defined inside a file and given a name. They help reduce code duplication.

**Important**: Template names are global across the entire chart and all subcharts. Always prefix template names with your chart name to avoid conflicts (e.g., `"myproject.commonLabels"`).

Create a file named `_helpers.tpl` inside the templates folder  
Add the following content to the file and save

```yaml
{{/*
Generate common labels
*/}}
{{- define "myproject.commonLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | default .Chart.Version }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
```

Edit the content of configmap.yaml and save

```yaml
{{- $theUserLocation := .Values.user.location | quote | upper -}}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-configmap
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
data:
  theChartName: {{ .Chart.Name }}
  theTemplateName: {{ .Template.Name }}
  message: {{ .Values.msg }}
  userName: {{ quote .Values.user.name }}
  userLocation: {{ $theUserLocation }}
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

Note: Use `include` instead of `template` because it allows you to process the output with functions like `nindent`

## Helm - Template vs Include (Practical Example)
Understanding the difference between `template` and `include` is crucial for proper YAML formatting.

Edit the content of `_helpers.tpl` and save

```yaml
{{/*
Generate common labels
*/}}
{{- define "myproject.commonLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | default .Chart.Version }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Generate app info (demonstrates indentation issue)
*/}}
{{- define "myproject.appInfo" -}}
app_name: {{ .Chart.Name }}
app_version: "{{ .Chart.AppVersion | default .Chart.Version }}"
environment: "production"
{{- end }}
```

First, let's see the problem with `template`. Create a file named `template-example.yaml` inside the templates folder and save

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-template-example
  labels:
{{ template "myproject.appInfo" . }}
data:
  message: "This shows template indentation issues"
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

**Notice the broken indentation under labels!** The output will show incorrect YAML structure. (# Source: myproject/templates/template-example.yaml)

Now let's fix it with `include`. Edit the content of template-example.yaml and save

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-include-example
  labels:
{{ include "myproject.appInfo" . | indent 4 }}
data:
  message: "This shows proper include indentation"
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

**Key Differences:**
- `template` inserts content directly without formatting control
- `include` allows piping output to functions like `indent`, `nindent`, `upper`, etc.
- Always use `include` for better YAML formatting control

Delete the template-example.yaml file when done experimenting

## Helm - Named Templates with Parameters
You can pass parameters to named templates using dictionaries.

Edit the content of `_helpers.tpl` and save

```yaml
{{/*
Generate common labels
*/}}
{{- define "myproject.commonLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | default .Chart.Version }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Generate resource name with optional suffix
*/}}
{{- define "myproject.resourceName" -}}
{{- $name := .name | default "default" -}}
{{- $suffix := .suffix | default "" -}}
{{ .Release.Name }}-{{ $name }}{{ if $suffix }}-{{ $suffix }}{{ end }}
{{- end }}
```

Edit the content of configmap.yaml and save

```yaml
{{- $theUserLocation := .Values.user.location | quote | upper -}}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "myproject.resourceName" (dict "Release" .Release "name" "config" "suffix" "data") }}
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
data:
  resourceName: {{ include "myproject.resourceName" (dict "Release" .Release "name" "sample") }}
  theChartName: {{ .Chart.Name }}
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

## Helm - Accessing Files Inside Templates
Helm provides access to files through the `.Files` object. Files must be outside the templates directory.

Create a folder named `configs` at the same level as Chart.yaml  
Create a file named `app.properties` inside the configs folder  
Add the following content to the file and save

```properties
database.host=localhost
database.port=5432
application.name=myapp
debug.enabled=true
```

Create a file named `settings.json` inside the configs folder  
Add the following content to the file and save

```json
{
  "server": {
    "port": 8080,
    "host": "0.0.0.0"
  },
  "features": {
    "logging": true,
    "metrics": false
  }
}
```

Edit the content of configmap.yaml and save

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-configmap
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
data:
  app.properties: |
{{ .Files.Get "configs/app.properties" | indent 4 }}
  settings.json: |
{{ .Files.Get "configs/settings.json" | indent 4 }}
  fileExists: {{ if .Files.Get "configs/app.properties" }}"true"{{ else }}"false"{{ end }}
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

## Helm - Files.Glob Patterns
Use glob patterns to work with multiple files at once. NOTE: Files.Glob returns binary content that needs to be converted to a string.

Edit the content of configmap.yaml and save

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-configmap
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
data:
{{- range $path, $content := .Files.Glob "configs/*" }}
  {{ base $path }}: |
{{ $content | toString | indent 4 }}
{{- end }}
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

## Helm - Files.AsConfig and Files.AsSecrets
Convert files directly into ConfigMap and Secret data formats.

Edit the content of configmap.yaml and save

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-files-config
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
data:
{{ (.Files.Glob "configs/*").AsConfig | indent 2 }}
---
apiVersion: v1
kind: Secret
metadata:
  name: {{ .Release.Name }}-files-secret
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
type: Opaque
data:
{{ (.Files.Glob "configs/*").AsSecrets | indent 2 }}
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

## Helm - Creating NOTES.txt
The NOTES.txt file displays instructions after chart installation.

Create a file named `NOTES.txt` inside the templates folder  
Add the following content to the file and save

```text
1. Get the application status:
   kubectl get configmap {{ .Release.Name }}-configmap -n {{ .Release.Namespace }}

2. Chart Information:
   - Chart Name: {{ .Chart.Name }}
   - Chart Version: {{ .Chart.Version }}
   - Release Name: {{ .Release.Name }}
   - Release Namespace: {{ .Release.Namespace }}

{{- if .Values.user.name }}
3. User Details:
   - Username: {{ .Values.user.name }}
   {{- if .Values.user.location }}
   - Location: {{ .Values.user.location | upper }}
   {{- end }}
{{- end }}

4. Quick Commands:
   helm status {{ .Release.Name }}
   helm get values {{ .Release.Name }}
```

Install the Helm Chart by running the follow command in a Visual Studio Code terminal

```bash
helm install demo myproject
```

Notice the NOTES are displayed after installation

Uninstall the Helm Chart by running the follow command in a Visual Studio Code terminal

```bash
helm uninstall demo
```

## Helm - Hooks and Annotations
Helm hooks allow you to intervene at certain points in a release lifecycle.

**Note: Ensure Docker Desktop is running with Kubernetes enabled before proceeding with this section.**

Create a file named `pre-install-job.yaml` inside the templates folder  
Add the following content to the file and save

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ .Release.Name }}-pre-install
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "-5"
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: pre-install
        image: busybox
        command: ['sh', '-c', 'echo "Pre-install hook executed for {{ .Release.Name }}"']
```

Create a file named `post-install-job.yaml` inside the templates folder  
Add the following content to the file and save

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ .Release.Name }}-post-install
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": post-install
    "helm.sh/hook-weight": "1"
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: post-install
        image: busybox
        command: ['sh', '-c', 'echo "Post-install hook executed for {{ .Release.Name }}"']
```

Install the Helm Chart by running the follow command in a Visual Studio Code terminal

```bash
helm install hookdemo myproject
```

View the hook execution by running the follow command in a Visual Studio Code terminal

```bash
kubectl get events --sort-by='.lastTimestamp' | grep hookdemo | tail -10
```

View the hook job logs by running the follow command in a Visual Studio Code terminal

```bash
kubectl logs job/hookdemo-pre-install
kubectl logs job/hookdemo-post-install
```

Uninstall the Helm Chart by running the follow command in a Visual Studio Code terminal

```bash
helm uninstall hookdemo
```

```bash
REDUCE TERMINAL CLUTTER, please delete:
- myproject/templates/pre-install-job.yaml
- myproject/templates/post-install-job.yaml
```

## Helm - Testing with Tests
Create test files that validate your deployment.

**Note: Ensure Docker Desktop is running with Kubernetes enabled before proceeding with this section.**

Create a folder named `tests` inside the templates folder  
Create a file named `configmap-test.yaml` inside the tests folder  
Add the following content to the file and save

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: "{{ .Release.Name }}-configmap-test"
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
spec:
  restartPolicy: Never
  containers:
  - name: configmap-test
    image: busybox
    command: ['sh', '-c', 'echo "Test passed: Chart {{ .Chart.Name }} deployed successfully" && exit 0']
```

Install the chart and run tests by running the follow commands in a Visual Studio Code terminal

```bash
helm install testrelease myproject
helm test testrelease --logs
helm uninstall testrelease
```

```bash
REDUCE TERMINAL CLUTTER, please delete:
- myproject/templates/tests/
- myproject/templates/tests/configmap-test.yaml
```

## Helm - Conditional Templates
Use conditional logic to include or exclude entire templates.

Create a file named `optional-secret.yaml` inside the templates folder  
Add the following content to the file and save

```yaml
{{- if .Values.createSecret }}
apiVersion: v1
kind: Secret
metadata:
  name: {{ .Release.Name }}-optional-secret
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
type: Opaque
data:
  secretKey: {{ .Values.secretValue | default "defaultSecret" | b64enc }}
{{- end }}
```

Edit the content of values.yaml and save

```yaml
msg: "hello world"
user:
  name: john smith
  location: usa
createSecret: true
secretValue: "mySecretValue"
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

Change createSecret to false in values.yaml and render again

```bash
helm template myproject
```

Notice the secret (# Source: myproject/templates/optional-secret.yaml) is not included when createSecret is false

## Helm - Advanced Function Usage
Explore more complex template functions and combinations.

Edit the content of values.yaml and save

```yaml
msg: "hello world"
user:
  name: john smith
  location: usa
environments:
  - name: dev
    replicas: 1
    resources:
      cpu: 100m
      memory: 128Mi
  - name: prod
    replicas: 3
    resources:
      cpu: 500m
      memory: 512Mi
```

Edit the content of configmap.yaml and save

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-configmap
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
data:
  environments: |
{{- range .Values.environments }}
    {{ .name }}: 
      replicas: {{ .replicas }}
      cpu: {{ .resources.cpu }}
      memory: {{ .resources.memory }}
{{- end }}
  environmentNames: "{{ range $i, $env := .Values.environments }}{{ if $i }},{{ end }}{{ $env.name }}{{ end }}"
  totalReplicas: "{{ $total := 0 }}{{ range .Values.environments }}{{ $total = add $total .replicas }}{{ end }}{{ $total }}"
  hasProductionEnv: "{{ $hasProd := false }}{{ range .Values.environments }}{{ if eq .name "prod" }}{{ $hasProd = true }}{{ end }}{{ end }}{{ $hasProd }}"
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

## Helm - Subcharts
Subcharts allow you to include other charts as dependencies within your chart.

Create a folder named `charts` at the same level as Chart.yaml  
Create a sub folder named `database` inside the `charts` folder

Continue with folder and files creation:

```
myproject/
├── Chart.yaml
├── charts/
│   └── database/
│       ├── Chart.yaml
│       ├── templates/
│       │   └── configmap.yaml
│       └── values.yaml
└── templates/
```

Edit the content of `charts/database/Chart.yaml` and save:

```yaml
apiVersion: v2
name: database
description: A subchart for database configuration
type: application
version: 0.1.0
appVersion: "1.0"
```

Edit the content of `charts/database/values.yaml` and save:

```yaml
replicaCount: 1
image:
  repository: postgres
  tag: "13"
service:
  type: ClusterIP
  port: 6767
config:
  database: myapp
  username: admin
```

Edit the content of `charts/database/templates/configmap.yaml` and save:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}-config
data:
  database: {{ .Values.config.database }}
  username: {{ .Values.config.username }}
  port: {{ .Values.service.port | quote }}
```

## Helm - Accessing Subchart Values from Parent
You can access subchart values from the parent chart using the subchart name.

Edit the content of the parent `configmap.yaml` and save

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-parent-config
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
data:
  parentChart: {{ .Chart.Name }}
  subchartDatabase: {{ .Values.database.config.database }}
  subchartPort: {{ .Values.database.service.port | quote }}
  message: "Parent chart connecting to {{ .Values.database.config.database }}"
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

## Helm - Override Subchart Values
You can override subchart values from the parent chart.

Edit the content of the parent `values.yaml` and save

```yaml
msg: "hello world"
user:
  name: john smith
  location: usa
# Overriding the Subchart values
database:
  config:
    database: prodapp
    username: produser
  service:
    port: 4141
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

## Helm - Global Values
Global values are accessible by both parent and subcharts using `.Values.global`.

Edit the content of the parent `values.yaml` and save

```yaml
global:
  environment: production
  region: us-east-1
  team: platform

msg: "hello world"
user:
  name: john smith
  location: usa
```

Edit the content of the parent `configmap.yaml` and save

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-parent-config
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
    environment: {{ .Values.global.environment }}
    team: {{ .Values.global.team }}
data:
  globalEnvironment: {{ .Values.global.environment }}
  globalRegion: {{ .Values.global.region }}
  globalTeam: {{ .Values.global.team }}
```

Edit the content of `charts/database/templates/configmap.yaml` and save

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}-config
  labels:
    environment: {{ .Values.global.environment }}
    team: {{ .Values.global.team }}
data:
  database: {{ .Values.config.database }}
  port: {{ .Values.service.port | quote }}
  # Global values accessible in subchart
  globalEnvironment: {{ .Values.global.environment }}
  globalRegion: {{ .Values.global.region }}
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

## Helm - External Dependencies/Subcharts (Chart.yaml)
Define external charts as dependencies in Chart.yaml

Edit the content of `Chart.yaml` and save

```yaml
apiVersion: v2
name: myproject
description: A Helm chart for Kubernetes
type: application
version: 0.1.0
appVersion: "1.16.0"

dependencies:
- name: common
  version: "2.x.x"
  repository: "https://charts.bitnami.com/bitnami"
  condition: common.enabled
- name: nginx
  version: "15.x.x"
  repository: "https://charts.bitnami.com/bitnami"
  condition: nginx.enabled
  alias: webserver
```

Update the parent `values.yaml` to include dependency configurations and save

```yaml
global:
  environment: production
  region: us-east-1
  team: platform

msg: "hello world"
user:
  name: john smith
  location: usa
```

Download dependencies by running the follow command in a Visual Studio Code terminal

```bash
cd ./myproject/
helm dependency update
```

This downloads the dependencies to the `charts/` folder

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
cd ..
helm template myproject
```

NOTE THE FOLLOWING AND PROCEED TO THE NEXT SECTION
```bash
# Source: myproject/charts/webserver/templates/svc.yaml
...
  annotations:
spec:
  type: LoadBalancer
  sessionAffinity: None
...
```

## Helm - External Dependencies/Subcharts Overrides
Override subchart values from the parent chart.

Update the parent `values.yaml` to override nginx defaults and save

```yaml
global:
  environment: production
  region: us-east-1
  team: platform

msg: "hello world"
user:
  name: john smith
  location: usa

# Override nginx subchart values (using alias 'webserver')
webserver:
  enabled: true
  service:
    type: ClusterIP
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

**Notice:** The nginx service shows `type: ClusterIP` instead of default `LoadBalancer`
```bash
# Source: myproject/charts/webserver/templates/svc.yaml
...
  annotations:
spec:
  type: ClusterIP
  sessionAffinity: None
...
```

## Helm - External Dependencies/Subcharts Imports
Create shorter aliases for subchart values.

Edit Chart.yaml to include import-values and save

```yaml
apiVersion: v2
name: myproject
description: A Helm chart for Kubernetes
type: application
version: 0.1.0
appVersion: "1.16.0"

dependencies:
- name: common
  version: "2.x.x"
  repository: "https://charts.bitnami.com/bitnami"
  condition: common.enabled
- name: nginx
  version: "15.x.x"
  repository: "https://charts.bitnami.com/bitnami"
  condition: nginx.enabled
  alias: webserver
  import-values:
  - child: service
    parent: importedService
```

Create a file named `import-demo.yaml` inside the templates folder  
Add the following content to the file and save

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-import-demo
data:
{{- if .Values.webserver.enabled }}
  directAccess: "{{ .Values.webserver.service.type }}"
  importedValue: "{{ .Values.importedService.type }}"
  areEqual: "{{ eq .Values.importedService.type .Values.webserver.service.type }}"
{{- end }}
```

Locally render the templates by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

**Notice:** Both `directAccess` and `importedValue` show the same value, proving import-values creates aliases.

## Helm - Schema Validation with values.schema.json
Create schema validation for your values.yaml to ensure type safety and required fields.

Create a file named `values.schema.json` at the same level as Chart.yaml  
Add the following content to the file and save

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "global": {
      "type": "object",
      "properties": {
        "environment": {
          "type": "string",
          "enum": ["development", "staging", "production"]
        }
      },
      "required": ["environment"]
    },
    "user": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "minLength": 1
        }
      },
      "required": ["name"]
    }
  },
  "required": ["global", "user"]
}
```

Test schema validation by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

Try with invalid values and see validation errors

```bash
helm template myproject --set global.environment=foobar
```

## Helm - Chart Metadata and Annotations
Enhance your Chart.yaml with comprehensive metadata and annotations.

Edit the content of `Chart.yaml` and save

```yaml
apiVersion: v2
name: myproject
description: A comprehensive Helm chart demonstrating advanced templating
type: application
version: 0.2.0
appVersion: "2.0.0"
home: https://github.com/myorg/myproject
sources:
  - https://github.com/myorg/myproject
maintainers:
  - name: Brian Singh
    email: brian.singh@company.com
    url: https://github.com/briansingh
keywords:
  - web
  - microservice
  - demo
icon: https://raw.githubusercontent.com/myorg/myproject/main/icon.png
annotations:
  category: ApplicationFramework
  licenses: Apache-2.0
  images: |
    - name: myproject
      image: myproject:2.0.0
  artifacthub.io/changes: |
    - Added schema validation
    - Enhanced documentation
    - Improved security defaults
  artifacthub.io/containsSecurityUpdates: "false"
  artifacthub.io/prerelease: "false"
  artifacthub.io/license: Apache-2.0

dependencies:
- name: common
  version: "2.x.x"
  repository: "https://charts.bitnami.com/bitnami"
  condition: common.enabled
- name: nginx
  version: "15.x.x"
  repository: "https://charts.bitnami.com/bitnami"
  condition: nginx.enabled
  alias: webserver
```

Package the chart to see how metadata is included by running the follow command in a Visual Studio Code terminal

```bash
helm package myproject
```

View the packaged chart information by running the follow command in a Visual Studio Code terminal

```bash
helm show chart myproject-0.2.0.tgz
```

## Helm - Library Charts
Create reusable library charts that contain common templates and functions.

Create a library chart by running the follow command in a Visual Studio Code terminal

```bash
helm create mylibrary
```

Clean up the mylibrary chart - delete all folders and files EXCEPT Chart.yaml and the templates folder

```
└── mylibrary
    ├── Chart.yaml
    └── templates
```

Edit `mylibrary/Chart.yaml` to make it a library chart and save

```yaml
apiVersion: v2
name: mylibrary
description: A library chart for common templates
type: library
version: 0.1.0
```

Clear `mylibrary/templates` folder and create `_common.tpl` with reusable templates and save

```yaml
{{/*
Common labels for all resources
*/}}
{{- define "mylibrary.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Generate resource name
*/}}
{{- define "mylibrary.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
```

BACK TO THE FIRST CHART - myproject

Add the library dependency to `myproject/Chart.yaml` and save

```yaml
apiVersion: v2
name: myproject
description: A Helm chart for Kubernetes
type: application
version: 0.1.0
appVersion: "1.16.0"

dependencies:
- name: common
  version: "2.x.x"
  repository: "https://charts.bitnami.com/bitnami"
  condition: common.enabled
- name: nginx
  version: "15.x.x"
  repository: "https://charts.bitnami.com/bitnami"
  condition: nginx.enabled
  alias: webserver
  import-values:
  - child: service
    parent: importedService
- name: mylibrary
  version: "0.1.0"
  repository: "file://../mylibrary"
```

Update dependencies by running commands in a Visual Studio Code terminal

```bash
cd myproject
helm dependency update
cd ..
```

Create `myproject/templates/library-demo.yaml` to test library functions and save

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "mylibrary.fullname" . }}-demo
  labels:
{{- include "mylibrary.labels" . | nindent 4 }}
data:
  message: "Library templates working!"
```

Test library functions by running the follow command in a Visual Studio Code terminal

```bash
helm template myproject
```

```bash
REDUCE TERMINAL CLUTTER, please delete:
- mylibrary
- myproject/charts
- myproject/configs
- myproject/templates/import-demo.yaml
- myproject/templates/library-demo.yaml
- myproject/templates/NOTES.txt
- myproject/templates/optional-secret.yaml
- myproject/Chart.lock
- myproject/values.schema.json
```

## Helm - Resource Policies and Annotations
Control resource lifecycle with Helm annotations.

**Note: Ensure Docker Desktop is running with Kubernetes enabled before proceeding with this section.**

Edit the content of `Chart.yaml` and save:

```yaml
apiVersion: v2
name: myproject
description: A Helm chart for Kubernetes
type: application
version: 0.1.0
appVersion: "1.16.0"
```

Edit the content of values.yaml and save

```yaml
msg: "hello world"
user:
name: john smith
location: usa
```

Edit the content of configmap.yaml and save

```yaml
{{- $theUserLocation := .Values.user.location | quote | upper -}}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-configmap
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
data:
  theChartName: {{ .Chart.Name }}
  theTemplateName: {{ .Template.Name }}
  message: {{ .Values.msg }}
  userName: {{ quote .Values.user.name }}
  userLocation: {{ $theUserLocation }}
```

Create a file named `persistent-resources.yaml` inside the templates folder  
Add the following content to the file and save

```yaml
# Resource that should be kept on uninstall
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-persistent-config
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
  annotations:
    "helm.sh/resource-policy": keep
data:
  important-data: "This data survives uninstall"
```

Test the resource policy by running commands in a Visual Studio Code terminal

```bash
# Install the chart
helm install test-policy myproject

# Verify the resources were created
kubectl get configmap

# Uninstall the chart (the persistent-config should remain)
helm uninstall test-policy

# Check that the persistent resource still exists
kubectl get configmap | grep persistent-config

# Clean up the persistent resource manually
kubectl delete configmap test-policy-persistent-config
```

## Helm - Multi-Environment Values Files
Organize values for different environments and deployment scenarios.

Create environment-specific values files:

Create a file named `values-dev.yaml` at the same level as Chart.yaml  
Add the following content and save

```yaml
global:
  environment: development
  region: us-west-2
  team: dev-team

replicaCount: 1

resources:
  limits:
    cpu: 200m
    memory: 256Mi
```

Create a file named `values-prod.yaml` at the same level as Chart.yaml  
Add the following content and save

```yaml
global:
  environment: production
  region: us-east-1
  team: platform

replicaCount: 3

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
```

Create a file named `environment-demo.yaml` inside the templates folder  
Add the following content to demonstrate environment-specific values

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-environment-config
  labels:
{{- include "myproject.commonLabels" . | nindent 4 }}
data:
  environment: {{ .Values.global.environment }}
  region: {{ .Values.global.region }}
  team: {{ .Values.global.team }}
  replicas: {{ .Values.replicaCount | quote }}
  cpu-limit: {{ .Values.resources.limits.cpu }}
  memory-limit: {{ .Values.resources.limits.memory }}
  deployment-tier: {{ if eq .Values.global.environment "production" }}"high-availability"{{ else }}"standard"{{ end }}
```

Test with different value files by running commands in a Visual Studio Code terminal

**Note**: Make sure to run these commands from inside the `myproject` directory where the `Chart.yaml` file is located.

```bash
# Navigate to the chart directory first
cd myproject

# Test with development values
helm template . -f values-dev.yaml

# Test with production values  
helm template . -f values-prod.yaml
```

```bash
REDUCE TERMINAL CLUTTER, please delete:
- myproject/values-dev.yaml
- myproject/values-prod.yaml
- myproject/templates/environment-demo.yaml
- myproject/templates/persistent-resources.yaml
```

## Helm - Advanced Debugging and Troubleshooting
Master debugging techniques for complex chart issues.

First, validate your chart structure and templates by running debugging commands in a Visual Studio Code terminal

```bash
# Validate chart structure and templates
helm lint myproject

# Debug template rendering with detailed output
helm template myproject --debug

# Test a dry-run installation to see what would be created
helm install --dry-run --debug test-debug myproject
```

**Note: Ensure Docker Desktop is running with Kubernetes enabled before proceeding with this section.**

```bash
# Install a release for testing debugging commands
helm install debug-release myproject

# Get rendered manifests of the installed release
helm get manifest debug-release

# Get all information about the release
helm get all debug-release

# Check release status and notes
helm status debug-release

# View release history
helm history debug-release

# Clean up the test release
helm uninstall debug-release
```
