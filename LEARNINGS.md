# 🧠 Assignment Documentation & Learnings

## System Architecture
This project successfully implemented a highly-available, load-balanced web application infrastructure on AWS.

1. **Backend Application**: A custom Node.js/Express "TaskFlow" application featuring a dual-navigation Easter Egg mechanism. Built to be modular and served statically.
2. **Process Management**: `PM2` was utilized to keep the Node.js application running continuously in the background on the virtual machines.
3. **Web Server / Reverse Proxy**: `Nginx` was configured on each EC2 instance to listen on port 80 and forward traffic to the internal Node.js port 3000. 
4. **Load Balancing**: An AWS Application Load Balancer (ALB) distributes incoming HTTP traffic evenly across two backend EC2 instances (`hello-1` and `hello-2`) utilizing a `/health` endpoint to monitor instance health.
5. **CI/CD Pipeline**: GitHub Actions was implemented to fully automate the deployment process. Every push to the `main` branch triggers a workflow that SSHs into both EC2 instances, pulls the latest code, and restarts PM2.

---

## Key Learnings

1. **Infrastructure as a Service (IaaS)**
   - Learned how to provision, configure, and manage raw Ubuntu EC2 servers via SSH.
   - Handled AWS Security Groups to properly route traffic, understanding that ALB needs public access while EC2s only need access from the ALB.
   
2. **Reverse Proxy & Process Managers**
   - Understood the difference between an application server (Node.js) and a web server (Nginx). Nginx acts as a powerful front door for the app.
   - Gained hands-on experience with PM2 to ensure the application automatically restarts if it crashes or the server reboots.

3. **High Availability**
   - Learned why multiple instances are necessary for production applications. If `hello-1` goes down, the AWS ALB automatically detects the health check failure and routes all traffic to `hello-2`, resulting in zero downtime.

4. **Continuous Deployment (CI/CD)**
   - Moving away from manual `git pull` actions over SSH.
   - Configured GitHub Actions to handle tedious deployment tasks automatically, leveraging GitHub Secrets to securely store API keys and `.pem` SSH certificates.
