# The CRASH course on Helm Templating - The Basics
## Prerequisites
1) Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2) Install [Visual Studio Code](https://code.visualstudio.com/)

### [Install Helm](https://helm.sh/docs/intro/install/)
1) Download the binary from https://github.com/helm/helm/releases
2) Unzip the binary to a directory on your system, such as `C:\Helm`
3) Add the local Helm directory to your PATH.

## Launch Docker Desktop and Enable Kubernetes via Settings

## Create a simple starter Helm Chart
1) Create a folder named - `LearnHelm`
2) Open the `LearnHelm` folder in Visual Studio Code
3) Run the follow command in a Visual Studio Code terminal
    ```
    helm create myproject
    ```

## The bare mininum Helm Chart
1) Delete all folders and files EXCEPT the `Chart.yaml` file
    ```
    └── myproject
        ├── Chart.yaml
        ├── charts
        ├── templates
        │   ├── NOTES.txt
        │   ├── _helpers.tpl
        │   ├── deployment.yaml
        │   ├── hpa.yaml
        │   ├── ingress.yaml
        │   ├── service.yaml
        │   ├── serviceaccount.yaml
        │   └── tests
        │       └── test-connection.yaml
        └── values.yaml
    ```
2) Install the Helm Chart by running the follow command in a Visual Studio Code terminal
    ```
    helm install myrelease myproject
    ```
3) Confirm the Helm Chart installation by running the follow command in a Visual Studio Code terminal
    ```
    helm list
    ```
4) Uninstall the Helm Chart by running the follow command in a Visual Studio Code terminal
    ```
    helm uninstall myrelease
    ```

## Helm - Built-in Objects
1) Create a folder named - `templates` at the same level as `Chart.yaml`
2) Create a file named - `configmap.yaml` inside the `templates` folder
3) Add the following content to the file and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
    ```
4) Install the Helm Chart by running the follow command in a Visual Studio Code terminal
    ```
    helm install myrelease myproject
    ```
5) Use Helm Get Manifest to view the generated Kubernetes resources by running the follow command in a Visual Studio Code terminal
    ```
    helm get manifest myrelease
    ```
6) Install the Helm Chart again by running the follow command in a Visual Studio Code terminal
    ```
    helm install foobar myproject
    ```
7) Use Helm Get Manifest to view the generated Kubernetes resources by running the follow command in a Visual Studio Code terminal
    ```
    helm get manifest foobar
    ```
8) Confirm the Helm Chart installations by running the follow command in a Visual Studio Code terminal
    ```
    helm list
    ```
9) Uninstall the Helm Charts by running the follow command in a Visual Studio Code terminal
    ```
    helm uninstall myrelease
    helm uninstall foobar
    ```

## Helm - Values Files and Locally render templates
1) Create a file named - `values.yaml` at the same level as `Chart.yaml`
2) Add the following content to the file and save
    ```
    msg: "hello world"
    ```
2) Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
    ```
3) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```

## Helm - Overriding entries in values.yaml during deployment
1) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject --set msg="test"
    ```
2) Note the value of `message` in the rendered configmap file

## Helm - Template Functions and Pipelines
1) Edit the content of `values.yaml` and save
    ```
    msg: "hello world"
    user:
      name: john smith
      location: usa
    ```
2) Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
      userName: {{ quote .Values.user.name }}
      userLocation: {{ upper .Values.user.location }}
    ```
3) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```
4) Note the usage of the quote and upper functions - https://helm.sh/docs/chart_template_guide/function_list/#string-functions
5) One of the powerful features of the template language is its concept of pipelines. Pipelines are an efficient way of getting several things done in sequence.
6) Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
      userName: {{ quote .Values.user.name }}
      userLocation: {{ .Values.user.location | quote | upper }}
    ```
7) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```
8) Note the value of userLocation

## Helm - Template Function - default
1) Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
      userName: {{ quote .Values.user.name }}
      userLocation: {{ .Values.user.location | quote | upper }}
      currency: {{ .Values.currency | default "usd" | upper }}
    ```
2) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```

## Helm - Template Function - toYaml
1) Edit the content of `values.yaml` and save
    ```
    msg: "hello world"
    user:
      name: john smith
      location: usa
    placesVisited:
      NY:
        NYC: 4
        Buffalo: 1
      TX:
        Dallas: 1
        Houston: 1
    ```
2) Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
      userName: {{ quote .Values.user.name }}
      userLocation: {{ .Values.user.location | quote | upper }}
      currency: {{ .Values.currency | default "usd" | upper }}
      visited: {{ .Values.placesVisited | toYaml | nindent 4 }}
    ```
3) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```

## Helm - Template Function - tpl
The `tpl` function allows developers to evaluate strings as templates inside a template.
1) Edit the content of `values.yaml` and save
    ```
    msg: "hello world"
    example: "{{ .Values.msg }} - {{ .Values.user.name }}"
    user:
      name: john smith
      location: usa
    placesVisited:
      NY:
        NYC: 4
        Buffalo: 1
      TX:
        Dallas: 1
        Houston: 1
    ```
2) Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
      userName: {{ quote .Values.user.name }}
      userLocation: {{ .Values.user.location | quote | upper }}
      currency: {{ .Values.currency | default "usd" | upper }}
      visited: {{ .Values.placesVisited | toYaml | nindent 4 }}
      greeting: {{ tpl .Values.example . }}
    ```
3) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```

## Helm - Template Function List
We will utilize a number of functions during this workshop 
but the comprehensive list of functions can be found here: https://helm.sh/docs/chart_template_guide/function_list/

## Helm - Flow Control - If/Else
1) The basic structure looks like this:
    ```
    {{ if PIPELINE }}
      # Do something
    {{ else if OTHER PIPELINE }}
      # Do something else
    {{ else }}
      # Default case
    {{ end }}
    ```
Notice that we are now talking about **pipelines** instead of **values**. 
The reason for this is to make it clear that control structures can execute an entire pipeline, not just evaluate a value.

2) A pipeline is evaluated as false if the value is:
    * a boolean false
    * a numeric zero
    * an empty string
    * a nil (empty or null)
    * an empty collection (map, slice, tuple, dict, array)

    **Under all other conditions, the condition is true.**
3) Edit the content of `values.yaml` and save
    ```
    msg: "hello world"
    user:
      name: john smith
      location:
    placesVisited:
      NY:
        NYC: 4
        Buffalo: 1
      TX:
        Dallas: 1
        Houston: 1
    ```
4) Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
    name: {{ .Release.Name }}-configmap
    data:
    theChartName: {{ .Chart.Name }}
    theTemplateName: {{ .Template.Name }}
    message: {{ .Values.msg }}
    userName: {{ quote .Values.user.name }}
    userLocation: {{ .Values.user.location | quote | upper }}
    currency: {{ .Values.currency | default "usd" | upper }}
    visited: {{ .Values.placesVisited | toYaml | nindent 4 }}
    {{ if .Values.user.location | quote | upper }} 
    locationProvided: true
    {{ else }} 
    locationProvided: false
    {{ end }}
    ```
5) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```

## Helm - Flow Control - If/Else (Controlling Whitespace)
As you can observe in the previous render, there are some unsightly whitespace in the output.
Luckly, Helm has tools to help...
The curly brace syntax can be modified to tell the template engine to chomp whitespaces.
`{{-` indicates that whitespace should be chomped left, while `-}}` means whitespace to the right should be consumed. 
1) Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
    name: {{ .Release.Name }}-configmap
    data:
    theChartName: {{ .Chart.Name }}
    theTemplateName: {{ .Template.Name }}
    message: {{ .Values.msg }}
    userName: {{ quote .Values.user.name }}
    userLocation: {{ .Values.user.location | quote | upper }}
    currency: {{ .Values.currency | default "usd" | upper }}
    visited: {{ .Values.placesVisited | toYaml | nindent 4 }}
    {{- if .Values.user.location | quote | upper }} 
    locationProvided: true
    {{- else }} 
    locationProvided: false
    {{- end }}
    ```
2) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```

**BYE BYE WHITESPACE**

3) Edit the content of `values.yaml` and save
    ```
    msg: "hello world"
    user:
      name: john smith
      location: usa
    placesVisited:
      NY:
        NYC: 4
        Buffalo: 1
      TX:
        Dallas: 1
        Houston: 1
    ```
5) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```

## Helm - Flow Control - If/Else (Simplify)
1) Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
    name: {{ .Release.Name }}-configmap
    data:
    theChartName: {{ .Chart.Name }}
    theTemplateName: {{ .Template.Name }}
    message: {{ .Values.msg }}
    userName: {{ quote .Values.user.name }}
    userLocation: {{ .Values.user.location | quote | upper }}
    currency: {{ .Values.currency | default "usd" | upper }}
    visited: {{ .Values.placesVisited | toYaml | nindent 4 }}
    locationProvided: {{- if .Values.user.location | quote | upper }} true {{- else }} false {{- end }}
    ```
2) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```

## Helm - Flow Control - With (Modifying scope)
1) Edit the content of `values.yaml` and save
    ```
    msg: "hello world"
    user:
      name: john smith
      location: usa
    placesVisited:
      NY:
        NYC: 4
        Buffalo: 1
      TX:
        Dallas: 1
        Houston: 1
      OK:
        Miami: 3
      FL:
        Miami: 7
    ```
2) Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
      userName: {{ quote .Values.user.name }}
      userLocation: {{ .Values.user.location | quote | upper }}
      currency: {{ .Values.currency | default "usd" | upper }}
      visited: {{ .Values.placesVisited | toYaml | nindent 4 }}
      locationProvided: {{- if .Values.user.location | quote | upper }} true {{- else }} false {{- end }}
      {{- with .Values.placesVisited.OK }}
      miamiOklahomaVisits: {{ .Miami }}
      {{- end }}
    ```
3) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```
4) What happens if you change the `with` line to `{{- with .Values.placesVisited.FL }}`? Is that correct?

5) `with` limits what can be accessed within its block. Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
      userName: {{ quote .Values.user.name }}
      userLocation: {{ .Values.user.location | quote | upper }}
      currency: {{ .Values.currency | default "usd" | upper }}
      visited: {{ .Values.placesVisited | toYaml | nindent 4 }}
      locationProvided: {{- if .Values.user.location | quote | upper }} true {{- else }} false {{- end }}
      {{- with .Values.placesVisited.OK }}
      miamiOklahomaVisits: {{ .Miami }}
      test: {{ .Template.Name }}
      {{- end }}
    ```
6) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```
7) There is an option available that will allow you to reach outside the scope limit. `$` is mapped to the root scope when template execution begins and it does not change during template execution. Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
      userName: {{ quote .Values.user.name }}
      userLocation: {{ .Values.user.location | quote | upper }}
      currency: {{ .Values.currency | default "usd" | upper }}
      visited: {{ .Values.placesVisited | toYaml | nindent 4 }}
      locationProvided: {{- if .Values.user.location | quote | upper }} true {{- else }} false {{- end }}
      {{- with .Values.placesVisited.OK }}
      miamiOklahomaVisits: {{ .Miami }}
      test: {{ $.Template.Name }}
      {{- end }}
    ```
8) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```

## Helm - Flow Control - Range
In Helm, the way to iterate through a collection is to use the `range` operator. Just like how `with` sets the scope of `.`, so does a `range` operator.
1) Edit the content of `configmap.yaml` and save
    ```
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
      userName: {{ quote .Values.user.name }}
      userLocation: {{ .Values.user.location | quote | upper }}
      currency: {{ .Values.currency | default "usd" | upper }}
      visited: {{ .Values.placesVisited | toYaml | nindent 4 }}
      locationProvided: {{- if .Values.user.location | quote | upper }} true {{- else }} false {{- end }}
      {{- with .Values.placesVisited.OK }}
      miamiOklahomaVisits: {{ .Miami }}
      {{- end }}
      citiesVisited:
      {{- range .Values.placesVisited }}
      {{- . | toYaml | nindent 4  }}
      {{- end }}
    ```
2) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```


## Helm - Flow Control - Variables
In Helm, a variable follows the form `$name`. Variables are assigned using the assignment operator, `:=`. In our `configmap.yaml`, there is a redundant reference, `.Values.user.location`, which can be replaced with a variable.
1) Edit the content of `configmap.yaml` and save
    ```
    {{- $theUserLocation := .Values.user.location | quote | upper -}}
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
      userName: {{ quote .Values.user.name }}
      userLocation: {{ $theUserLocation }}
      currency: {{ .Values.currency | default "usd" | upper }}
      visited: {{ .Values.placesVisited | toYaml | nindent 4 }}
      locationProvided: {{- if $theUserLocation }} true {{- else }} false {{- end }}
      {{- with .Values.placesVisited.OK }}
      miamiOklahomaVisits: {{ .Miami }}
      {{- end }}
      citiesVisited:
      {{- range .Values.placesVisited }}
      {{- . | toYaml | nindent 4  }}
      {{- end }}
    ```
2) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```

Variables are particularly useful in `range` loops.
They can be used on list-like objects to capture both the `index` and the `value`.

3) Edit the content of `values.yaml` and save
    ```
    msg: "hello world"
    user:
      name: john smith
      location: usa
    placesVisited:
      NY:
        NYC: 4
        Buffalo: 1
      TX:
        Dallas: 1
        Houston: 1
      OK:
        Miami: 3
      FL:
        Miami: 7
    inventory:
      - watch
      - headphone
      - sunglasses
    ```
4) Edit the content of `configmap.yaml` and save
    ```
    {{- $theUserLocation := .Values.user.location | quote | upper -}}
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: {{ .Release.Name }}-configmap
    data:
      theChartName: {{ .Chart.Name }}
      theTemplateName: {{ .Template.Name }}
      message: {{ .Values.msg }}
      userName: {{ quote .Values.user.name }}
      userLocation: {{ $theUserLocation }}
      currency: {{ .Values.currency | default "usd" | upper }}
      visited: {{ .Values.placesVisited | toYaml | nindent 4 }}
      locationProvided: {{- if $theUserLocation }} true {{- else }} false {{- end }}
      {{- with .Values.placesVisited.OK }}
      miamiOklahomaVisits: {{ .Miami }}
      {{- end }}
      citiesVisited:
      {{- range .Values.placesVisited }}
      {{- . | toYaml | nindent 4  }}
      {{- end }}
      items:
        {{- range $index, $item := .Values.inventory }}
        - {{ $index }}: {{ $item | title | quote }}
        {{- end }}
    ```
5) Locally render the templates by running the follow command in a Visual Studio Code terminal
    ```
    helm template myproject
    ```

    
