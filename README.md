## 📦 Digital Inventory System [5-Tier Microservices Architecture]

This project utilizes **HTML5, CSS3, and Vanilla JavaScript** for the lightweight presentation layer while **Node.js (Express)** powers both the Identity and Business Logic tiers. The architecture demonstrates scalable deployment patterns and distributed security coordination via a shared-secret token. To ensure enterprise readiness, the application provides full deployment support for both **Docker Compose** (for rapid local development) and **Kubernetes** (for production-grade orchestration).

---

## 🏗 System Architecture Diagram

<div align="center">

![](/images/img01.jpg)

</div>

---

## 📂 Project Structure
* `/frontend`: Nginx configuration and Vanilla JS web interface.
* `/auth`: Node.js identity provider service.
* `/backend`: Node.js inventory management API.
* `docker-compose.yml`: Allows developers to spin up the entire 5-tier stack—including local MongoDB and Redis instances—with a single command. It uses a `.env` file for easy configuration of credentials and connection strings.
* `/k8s`: Kubernetes manifest files for deployments and services.

---

## 🛠 Tier-by-Tier Breakdown

### Tier 1: Presentation Layer (Frontend - Nginx)
* **Role:** Acts as the primary entry point and traffic orchestrator.
* **Mechanism:** An unprivileged **Nginx** server serves the static `index.html`. It operates as a high-performance **Reverse Proxy**.
* **Traffic Routing:**
    * `POST /api/auth/` $\rightarrow$ Proxy pass to **Auth Service** (Port 4000).
    * `GET/POST/PUT/DEL /api/products/` $\rightarrow$ Proxy pass to **Backend Service** (Port 5000).

### Tier 2: Identity & Secret Tier (Auth Service)
* **Role:** Manages user authentication and **Global Secret Generation**.
* **Mechanism:** Upon startup, it executes a "Secret Handshake" with **Redis (Tier 4)**:
    * It checks for an existing `system_jwt_secret`.
    * If absent, it generates a random **32-byte hex string** and saves it to the cache.
    * **Scaling Benefit:** This ensures that if you scale to multiple Auth replicas, they all sign tokens with the exact same key.
* **Database:** Connects to **MongoDB (Tier 5)** to verify user credentials and seed the initial admin account.

### Tier 3: Logic & Processing Tier (Backend Service)
* **Role:** Handles Business Logic and Product Inventory Management.
* **Mechanism:** Designed to be **stateless** regarding security:
    1.  On every request, it fetches the `system_jwt_secret` from **Redis (Tier 4)**.
    2.  It uses this shared secret to verify the incoming JWT token.
    3.  Once validated, it communicates with **MongoDB (Tier 5)** to perform CRUD operations on products.

### Tier 4: Distributed Cache Tier (Redis)
* **Role:** The **"Single Source of Truth"** for system secrets and high-speed coordination.
* **Mechanism:** Holds the volatile security keys in-memory. This allows Tier 2 and Tier 3 to communicate securely without hard-coded secrets in environment variables, making the stack highly "pluggable" and secure.

### Tier 5: Data Persistence Tier (MongoDB)
* **Role:** Permanent storage for Users and Inventory data.
* **Mechanism:** Uses **Mongoose** to enforce data schemas. 
* **Environment Agnostic:** * **Development:** Uses a local Docker containerized Mongo instance.
    * **Production:** Connects to a managed **MongoDB Atlas** cluster via the `MONGO_URI` connection string.

---

## 🔐 The "Shared Secret" Flow
1.  **Auth Service** generates a secret and stores it in **Redis**.
2.  **User** logs in $\rightarrow$ **Auth Service** signs a JWT with the secret from **Redis**.
3.  **User** requests data $\rightarrow$ **Backend** pulls the secret from **Redis** to verify the JWT and serves data from **MongoDB**.

---

## 🚀 Deployment Modes

| Mode | Database | Cache | Description |
| :--- | :--- | :--- | :--- |
| **Development** | Local Mongo Container | Local Redis Container | Rapid local testing and UI development. |
| **Production** | MongoDB Atlas | Local Redis Container | Scalable, high-availability cloud deployment. |
