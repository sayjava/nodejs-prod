#!/usr/bin/env bash

set -eo pipefail

help() {
    echo "Usage: go <command>"
    echo 
    echo  "    help        Print this help"
    echo 
    echo  "Common commands: "
    echo  "    dev             Start development using dev env files"
    echo  "    test            Run all unit tests"
    echo  "    start           Start with prod env files"
    exit 0
}

dev () {
    echo -e "Starting dev"
    # locally expand the configuration in the dev.env into process.env
    export $(cat config/dev.env | xargs) 
    node index.js
}

start () {
    echo -e "Starting start"
    #  in a prod environment, we expect the envs to be 
    #  provided by config-maps not by export $(cat config/prod.env | xargs)
    node index.js
}

create-config-map () {
    env_file="config/$1.env"
    
    echo "Generating config map from  ---- > $env_file"
    
    kubectl create configmap nodeapp-config --from-env-file $env_file \
    --dry-run -o yaml |\
    kubectl apply -f -
}

# deploy to cluster
deploy () {
    echo -e "Starting deployment"
    

    # generate the config map for prod environment
    # the config must be generated before deploying the app
    create-config-map "prod"

    # deploy the app using the new created/updated config map
    kubectl apply -f k8-config.yml

    # wait to see that all deployment has succeded 
    kubectl rollout status deployment/nodeapp
}

# local kubernettes deployment token
local-k8-admin () {
    # generate a token for the local k8-dashboard app
    kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | \
    grep admin-user | \
    awk '{print $1}')
}

# forward the local port into the cluster 
port-forward () {
    kubectl port-forward deployment/nodeapp 8080:8080
}

if [[ $1 =~ ^(dev|start|test|deploy|local-k8-admin|port-forward)$ ]]; then
  COMMAND=$1
  shift
  $COMMAND "$@"
else
  help
  exit 1
fi
