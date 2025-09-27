
# FreelanceHub Connect

A full-stack freelance bidding platform enabling real-time auctions, fast project search, and secure payments. Built using the MERN stack with Socket.io, Redis Pub/Sub, and Razorpay for real-time communication, accelerated search, and seamless payments. Deployed on Azure Kubernetes Service (AKS) with GitOps via ArgoCD, monitoring via Prometheus + Grafana, and automated CI/CD pipelines for scalability, reliability, and streamlined development workflow.

## 🔧 Key Features

- ⚡ **Real-Time Bidding**: Sub-200 ms latency updates using Socket.io with Redis Pub/Sub for scalable real-time communication across multiple server instances.  
- 🚀 **Optimized Search & Filtering**: Redis caching accelerates project discovery, improving search speed by 40%.  
- 💬 **Post-Payment Chat**: Real-time messaging between clients and freelancers post-transaction for smooth collaboration.  
- 💳 **Secure Payments**: Integrated with Razorpay to ensure fast and secure online transactions.  
- ☁️ **Cloud-Native Deployment**: Deployed on Azure Kubernetes Service (AKS) with auto-scaling, load balancing, and zero-downtime updates.  
- 🔄 **GitOps with ArgoCD**: Ensures cluster state always matches Git repository using declarative sync and rollback support.  
- 📊 **Monitoring & Observability**: Prometheus collects system metrics (CPU, memory, pods, nodes, disk usage), while Grafana provides real-time dashboards and alerting.  
- 🔄 **Automated CI/CD Pipeline**: GitHub Actions handle automated testing, building, security scans, and seamless deployments to AKS.  
- 📈 **Horizontal Scalability**: Redis Pub/Sub enables scaling across multiple server instances without losing real-time functionality.  

## 🛠️ Tech Stack

| Layer             | Technology                           |
|-------------------|--------------------------------------|
| Frontend         | React.js                             |
| Backend          | Node.js, Express.js                  |
| Database         | MongoDB                              |
| Realtime Comm.   | Socket.io, Redis Pub/Sub             |
| Caching Layer    | Redis                                |
| Payment Gateway  | Razorpay                             |
| Deployment       | Azure Kubernetes Service (AKS)       |
| DevOps           | Docker, GitHub Actions (CI/CD), ArgoCD (GitOps) |
| Monitoring       | Prometheus, Grafana                  |

## 🏗️ Architecture Overview  

<img width="1020" height="628" alt="image" src="https://github.com/user-attachments/assets/6f96e005-5174-4e80-abde-49403d945eee" />


The platform follows a Monolithic architecture:  
- **Frontend**: React.js for responsive UI with real-time updates via Socket.io.  
- **Backend**: Node.js/Express.js for APIs, integrated with MongoDB for persistence.  
- **Real-Time Layer**: Socket.io for bidirectional communication, scaled with Redis Pub/Sub.  
- **Caching**: Redis for fast project search and session handling.  
- **Payments**: Razorpay API for secure transactions.  
- **Deployment**: Dockerized services orchestrated on AKS.  
- **GitOps**: ArgoCD ensures Git and cluster remain in sync.  
- **Monitoring**: Prometheus + Grafana provide insights into pods, nodes, CPU/memory/disk usage, and system health.


## 🧑‍💻 Getting Started

1. **Clone the Repository**  
   ```
   git clone https://github.com/your-username/freelance-bidding-platform.git
   cd freelance-bidding-platform
   ```

2. **Setup Backend**  
   Navigate to the backend directory:  
   ```
   cd backend
   npm install
   ```

3. **Setup Frontend**  
   Navigate to the frontend directory:  
   ```
   cd frontend
   npm install
   ```

4. **Configure Environment Variables**  
   Create `.env` files in both the `backend/` and `frontend/` directories.  

     
   🔐 Sample Backend .env  

   ```
   # Database  
   MONGO_URI=mongodb://localhost:27017/freelance-db  

   # Redis  
   REDIS_HOST=localhost  
   REDIS_PORT=6379  

   # Razorpay  
   RAZORPAY_KEY_ID=your_razorpay_key_id  
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret  

   # JWT Secret  
   JWT_SECRET=your_jwt_secret  

   # Other  
   PORT=5000  
   NODE_ENV=development  
   ```  

   For the frontend `.env`,
   🔐 Sample Frontend .env  
   ```
    # Frontend URL for CORS  
      FRONTEND_URL=your_url
   ```  

   After setup, run the backend with `npm run dev` and the frontend with `npm start`.

## 🚀 Deployment & DevOps

### Docker Containerization  
The application is fully containerized using Docker to ensure consistency across different environments.  
Each service has its own Dockerfile and is built into lightweight images for portability and reproducibility.  

Build images with:  
```
docker build -t freelance-backend ./backend
docker build -t freelance-frontend ./frontend
```


### AKS Deployment  
The system is deployed on **Azure Kubernetes Service (AKS)** for reliable, scalable, and secure orchestration. Key features include:  
- **Auto-scaling** based on CPU/memory thresholds  
- **Load balancing** across multiple pods for high availability  
- **Zero-downtime deployments** with rolling updates  
- **Self-healing** pods via liveness and readiness probes  

All Kubernetes manifests are stored in the `k8s-manifests/` directory and can be applied with:  
```
kubectl apply -f k8s-manifests/
```

### GitOps with ArgoCD  
We use **ArgoCD** to implement GitOps principles for managing Kubernetes workloads.  
- Continuously watches the Git repository for manifest changes  
- Automatically syncs updates to the AKS cluster  
- Guarantees that the **cluster state always matches the Git source of truth**  
- Provides a visual dashboard for tracking deployment health, rollbacks, and sync status  

This ensures a **declarative, reliable, and auditable** deployment workflow.  

### Monitoring & Observability  
Cluster monitoring and observability are handled with a **Prometheus + Grafana stack**:  
- **Prometheus** scrapes, stores, and queries metrics like CPU usage, memory consumption, disk I/O, pod health, and node performance.  
- **Grafana** provides rich dashboards to visualize these metrics in real time.  
- **Alerting rules** in Prometheus notify when thresholds are breached (e.g., high CPU/memory usage, failing pods, low disk space).  

This setup enables **proactive monitoring, issue detection, and resource optimization**.  

### CI/CD Pipeline  
Our CI/CD workflow is automated using **GitHub Actions**, covering the full development lifecycle:  
- **Code Quality**: ESLint, automated testing, and type checking  
- **Security**: Dependency and container vulnerability scanning  
- **Automated Testing**: Unit and integration test suites  
- **Docker Image Building**: Multi-stage builds for lean and optimized images  
- **AKS Deployment**: Automatic deployment to staging/production clusters  

Pipelines are defined in `.github/workflows/`, ensuring consistency and repeatability in releases.  

---

## 📦 Core Functionalities

### Freelancers can:  
- Browse & filter projects with advanced search  
- Bid in real time across multiple server instances  
- Securely chat with clients after payment  

### Clients can:  
- Post and manage projects  
- Receive live bids and select freelancers instantly  
- Connect with freelancers post-payment  

### System Features:  
- **Redis Pub/Sub** for horizontal scaling of real-time features  
- **AKS-powered high availability** for resilient infrastructure  
- **ArgoCD GitOps** for declarative, reliable cluster management  
- **Prometheus + Grafana** for system metrics, dashboards, and alerts  
- **Automated CI/CD pipelines** for continuous delivery  

---

## 🤝 Contributing  

We welcome contributions! Follow the steps below to get started:  
1. Fork the repository.  
2. Create a new branch: `git checkout -b feature/your-feature`.  
3. Commit your changes: `git commit -m 'Add your feature'`.  
4. Push to the branch: `git push origin feature/your-feature`.  
5. Open a Pull Request.  

Please ensure your code follows the project's coding standards and includes tests.

## 📬 Contact  

Harshvardhan Pandey  
📧 harshvardhanpandey2003@gmail.com  
🔗 [GitHub Profile](https://github.com/HarshvardhanPandey2003)

## 📄 License  

This project is licensed under the MIT License. See the LICENSE file for more details.
