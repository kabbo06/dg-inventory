## 📦 ENV Information for Deployments

This project used local MongoDB container for DEV environment and MongoDb Atlas cloud DB for PROD environment. ENV list is given below for deployment understanding.

## 🏗 Docker-Composer (DEV)

REDIS_PASSWORD

MONGO_INITDB_ROOT_USERNAME

MONGO_INITDB_ROOT_PASSWORD

MONGO_URI

SERVER_NAME

## 🏗 Docker-Composer (PROD)

REDIS_PASSWORD

MONGO_URI

SERVER_NAME

## 🏗 Kubernetes (DEV Environment Variable & Secret)

SERVER_NAME

---

KUBECONFIG
	
MONGO_ROOT_PASSWORD
	
MONGO_ROOT_USER
	
MONGO_URI
	
REDIS_PASSWORD

## 🏗 Kubernetes (PROD Environment Variable & Secret)

SERVER_NAME

REPLICAS

---

KUBECONFIG
	
MONGO_URI
	
REDIS_PASSWORD

## 🏗 Repository (Variable & Secret)

DOCKERHUB_TOKEN

DOCKERHUB_USERNAME

