
# FreelanceHub Connect

A full-stack freelance bidding platform enabling real-time auctions, fast project search, and secure payments. Built using the MERN stack with Socket.io, Redis Pub/Sub, and Razorpay for real-time communication, accelerated search, and seamless payments. Deployed on Azure Kubernetes Service (AKS) with automated CI/CD pipelines for scalability and streamlined development workflow.

## 🔧 Key Features

- ⚡ **Real-Time Bidding**: Sub-200 ms latency updates using Socket.io with Redis Pub/Sub for scalable real-time communication across multiple server instances.
- 🚀 **Optimized Search & Filtering**: Redis caching accelerates project discovery, improving search speed by 40%.
- 💬 **Post-Payment Chat**: Real-time messaging between clients and freelancers post-transaction for smooth collaboration.
- 💳 **Secure Payments**: Integrated with Razorpay to ensure fast and secure online transactions.
- ☁️ **Cloud-Native Deployment**: Deployed on Azure Kubernetes Service (AKS) for high availability, auto-scaling, and container orchestration.
- 🔄 **Automated CI/CD Pipeline**: Streamlined development workflow with automated testing, building, and deployment processes.
- 📈 **Horizontal Scalability**: Redis Pub/Sub enables seamless scaling across multiple server instances without losing real-time functionality.

## 🛠️ Tech Stack

| Layer             | Technology                  |
|-------------------|-----------------------------|
| Frontend         | React.js                    |
| Backend          | Node.js, Express.js         |
| Database         | MongoDB                     |
| Realtime Comm.   | Socket.io, Redis Pub/Sub    |
| Caching Layer    | Redis                       |
| Payment Gateway  | Razorpay                    |
| Deployment       | Azure Kubernetes Service    |
| DevOps           | CI/CD Pipeline              |
| Container        | Docker                      |

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

     

   For the frontend `.env`, include necessary API URLs and keys as needed (e.g., `REACT_APP_API_URL=http://localhost:5000`).

   After setup, run the backend with `npm run dev` and the frontend with `npm start`.

## 🚀 Deployment & DevOps

### Docker Containerization  
The application is containerized using Docker for consistent environments. Build images with:  
```
docker build -t freelance-backend ./backend
docker build -t freelance-frontend ./frontend
```

### AKS Deployment  
The application is deployed on Azure Kubernetes Service (AKS) for:  
- Auto-scaling based on CPU/memory usage  
- Load balancing across multiple pods  
- Zero-downtime deployments  
- Health monitoring and automatic recovery  

Deploy using Kubernetes manifests (available in the `k8s/` directory) with `kubectl apply -f k8s/`.

### CI/CD Pipeline  
Automated workflow includes:  
- Code Quality Checks - ESLint, testing  
- Security Scanning - Vulnerability assessment  
- Automated Testing - Unit and integration tests  
- Docker Image Building - Multi-stage builds for optimization  
- AKS Deployment - Automatic deployment to staging/production  

Pipelines are configured using GitHub Actions (see `.github/workflows/`).

## 📦 Core Functionalities

### Freelancers can:  
- Browse & filter projects  
- Bid in real time across multiple server instances  
- Chat with clients after payment  

### Clients can:  
- Post projects  
- Receive & manage bids live  
- Connect with freelancers post-payment  

### System Features:  
- Horizontal scaling with Redis Pub/Sub  
- High availability on AKS cluster  
- Automated deployment and monitoring  

## 🏗️ Architecture Overview  

The platform follows a microservices-inspired architecture:  
- **Frontend**: React.js for responsive UI with real-time updates via Socket.io.  
- **Backend**: Node.js/Express.js handling API requests, integrated with MongoDB for data persistence.  
- **Real-Time Layer**: Socket.io for bidirectional communication, backed by Redis Pub/Sub for scalability.  
- **Caching**: Redis for fast search and session management.  
- **Payments**: Razorpay API for secure transactions.  
- **Deployment**: Docker containers orchestrated on AKS with CI/CD for automation.  

For a detailed diagram, refer to the `docs/architecture.png` file (if available in the repository).

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
