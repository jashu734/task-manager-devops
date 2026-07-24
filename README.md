# Full-Stack DevOps Task Manager on AWS

A full-stack DevOps learning project demonstrating modern cloud-native practices on AWS using **Docker**, **Terraform (IaC)**, **GitHub Actions (CI/CD)**, **Amazon ECS Fargate**, **Amazon RDS (PostgreSQL)**, **Application Load Balancer (ALB)**, and **Amazon CloudWatch**.

---

## 🏗 Architecture

```
                             [ Internet / Users ]
                                     │
                                     ▼
                      [ Application Load Balancer (ALB) ]
                                     │ (HTTP / Health check /health)
                                     ▼
                      [ ECS Fargate (Task Manager App) ]
                        ├── Express.js REST API
                        └── Static Glassmorphism UI
                                     │
                                     ├──► [ RDS PostgreSQL Database ] (Port 5432)
                                     └──► [ CloudWatch Logs & Alarms ]
```

---

## 🛠 Tech Stack

- **Backend**: Node.js + Express REST API
- **Database**: PostgreSQL (Docker locally, RDS in AWS)
- **Frontend**: Single-page HTML5 / Modern CSS / Vanilla JS with glassmorphism design
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions (CI for lint/test & ECR push; CD for ECS deployment)
- **Infrastructure as Code**: Terraform (AWS Provider)
- **AWS Services**: VPC, Subnets, Security Groups, ECR, ECS Fargate, ALB, RDS PostgreSQL, CloudWatch

---

## 📁 Repository Structure

```
devops-task-manager/
├── .github/
│   └── workflows/
│       ├── ci.yml          # Continuous Integration: Test & Push Docker Image to ECR
│       └── cd.yml          # Continuous Deployment: Force new ECS deployment
├── backend/
│   ├── public/             # Single page frontend assets (index.html, style.css, app.js)
│   ├── tests/              # Jest & Supertest unit/health tests
│   ├── db.js               # PostgreSQL connection pool & auto-migration
│   ├── server.js           # Express REST API & /health endpoint
│   └── package.json
├── infra/                  # Terraform Infrastructure Code
│   ├── versions.tf         # AWS Provider & required version
│   ├── variables.tf        # Configurable variables
│   ├── outputs.tf          # Terraform output definitions
│   ├── vpc.tf              # VPC, Subnets, IGW & Route tables
│   ├── security_groups.tf  # ALB, ECS, and RDS Security Groups
│   ├── ecr.tf              # ECR Repository definition
│   ├── rds.tf              # RDS PostgreSQL Instance
│   ├── alb.tf              # ALB, Target Group (/health check), Listener
│   ├── ecs.tf              # ECS Cluster, Task Definition & Service
│   └── cloudwatch.tf       # Log Group & High CPU / Unhealthy host Alarms
├── Dockerfile              # Production Docker build specification
├── docker-compose.yml      # Local development environment (App + Postgres)
├── .gitignore
├── .dockerignore
└── README.md
```

---

## 🚀 Phase 1: Local Development with Docker Compose

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Quick Start
1. Clone or navigate to the project directory:
   ```bash
   cd devops-task-manager
   ```
2. Build and start the containers locally:
   ```bash
   docker-compose up --build -d
   ```
3. Verify running containers:
   ```bash
   docker-compose ps
   ```
4. Access the web app in your browser:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Health Check Endpoint**: [http://localhost:3000/health](http://localhost:3000/health)

   *Expected Health Response:*
   ```json
   {
     "status": "UP",
     "database": "connected",
     "timestamp": "2026-07-24T15:30:00.000Z"
   }
   ```

5. Stop local containers:
   ```bash
   docker-compose down -v
   ```

---

## 🧪 Phase 2 & 4: CI/CD Pipelines (GitHub Actions)

### Required GitHub Repository Secrets
Before pushing to GitHub, configure the following secrets in your repository (**Settings** -> **Secrets and variables** -> **Actions**):

| Secret Name | Description | Example Value |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | AWS IAM Access Key ID | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Access Key | `veLK...` |
| `AWS_REGION` | AWS Region for deployment | `us-east-1` |

### How Pipelines Work
1. **CI Pipeline (`.github/workflows/ci.yml`)**:
   - Triggers on `push` or `pull_request` to `main`.
   - Runs `npm test` in the `backend/` directory.
   - Logs into Amazon ECR, builds the Docker image, and pushes it with tags `:latest` and `:${{ github.sha }}`.

2. **CD Pipeline (`.github/workflows/cd.yml`)**:
   - Triggers automatically after successful completion of the CI workflow.
   - Executes `aws ecs update-service --force-new-deployment` to update the running Fargate task with the fresh image.

---

## 🏛 Phase 3: Infrastructure Setup with Terraform

### Step-by-Step Deployment
1. Navigate to the `infra/` folder:
   ```bash
   cd infra
   ```

2. Initialize Terraform modules and providers:
   ```bash
   terraform init
   ```

3. Preview the infrastructure resources to be created:
   ```bash
   terraform plan
   ```

4. Apply the configuration to provision AWS infrastructure:
   ```bash
   terraform apply -auto-approve
   ```

5. Retrieve the Application Load Balancer URL from the Terraform outputs:
   ```bash
   Outputs:
   alb_dns_name = "devops-task-manager-alb-123456789.us-east-1.elb.amazonaws.com"
   ecr_repository_url = "123456789012.dkr.ecr.us-east-1.amazonaws.com/devops-task-manager"
   ```

6. Open the `alb_dns_name` URL in your browser to verify the deployed task manager app!

---

## 📊 Phase 5: Observability & CloudWatch

- **Application Logs**: Integrated with Amazon CloudWatch Log Group `/ecs/devops-task-manager`.
- **High CPU Alarm**: Triggers when ECS task CPU exceeds 80% over 2 consecutive periods.
- **Unhealthy Host Alarm**: Triggers when ALB target group reports 1 or more failing `/health` checks.

---

## 🧹 Teardown / Cleanup Instructions (Avoid AWS Charges)

> [!CAUTION]
> Always run `terraform destroy` when finished testing to prevent unexpected AWS charges for ALB, ECS Fargate, or RDS instances.

1. Navigate to the `infra/` directory:
   ```bash
   cd infra
   ```

2. Tear down all provisioned AWS resources:
   ```bash
   terraform destroy -auto-approve
   ```

3. Confirm that all resources (ALB, ECS, RDS, Security Groups, VPC) have been removed cleanly.
