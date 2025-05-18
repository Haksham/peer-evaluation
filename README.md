# Peer-evaluation

            peer-eval/
            ├── backend/
            │   ├── .env                # Backend environment variables (port, DB URL, etc.)
            │   ├── Dockerfile          # Docker instructions for backend service
            │   ├── package.json        # Backend dependencies and scripts
            │   └── server.js           # Express + Socket.IO backend server
            ├── frontend/
            │   ├── .gitignore          # Ignore rules for frontend
            │   ├── Dockerfile          # Docker instructions for frontend service
            │   ├── app/
            │   │   ├── client/page.js  # Peer evaluation submission UI (client)
            │   │   ├── globals.css     # Global styles (Tailwind, fonts, etc.)
            │   │   ├── layout.js       # Root layout for Next.js app
            │   │   └── page.js         # Host dashboard UI (shows evaluations)
            │   ├── jsconfig.json       # Path aliases for frontend code
            │   ├── next.config.mjs     # Next.js configuration
            │   ├── package.json        # Frontend dependencies and scripts
            │   └── postcss.config.mjs  # PostCSS config (for Tailwind)
            ├── .gitignore              # Ignore rules for the whole project
            ├── commands.txt            # Helpful Docker commands
            ├── docker-compose.yml      # Multi-container Docker orchestration
            ├── LICENSE                 # Project license (CC0)
            └── README.md               # Project overview (currently minimal)

# Project Description:

## backend/:
- Contains an Express server with Socket.IO for real-time peer evaluation data. 
- It stores evaluations in memory and exposes them via WebSocket and a REST endpoint. 
- The backend is containerized with its own Dockerfile.

## frontend/:
A Next.js app with two main pages:

- / (Host Dashboard): Displays all peer evaluations in real time.
- /client (Client Page): Allows users to submit peer evaluations. Uses Tailwind CSS for styling and connects to the backend via Socket.IO. 
- Also containerized with its own Dockerfile.
docker-compose.yml:
- Defines and runs both frontend and backend containers together, exposing ports 3000 (frontend) and 4000 (backend).

### Other files:

- .gitignore files to exclude dependencies and sensitive files.
- commands.txt with common Docker commands.
- LICENSE (CC0) and README.md for project info.

## SonarCloud Report

For a full and detailed analysis of the code, including issues like bugs, vulnerabilities, code smells, and test coverage, please visit the [SonarCloud Project Report](https://sonarcloud.io/project/overview?id=Haksham_peer-evaluation).

### Key Metrics:
- **Quality Gate Status**: [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- **Lines of Code**: [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- **Bugs**: Number of bugs found in the code.[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- **Vulnerabilities**: Any security-related issues.[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- **Code Smells**: Areas where the code could be improved for better maintainability.[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- **Code Coverage**: Percentage of code covered by unit tests.[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- **Duplicated Code**: Amount of code duplication detected.[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- **Reliablity Rating**: [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- **Security Rating**: [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- **Technical Debt**: [![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)
- **Maintainability Rating**: [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Haksham_peer-evaluation&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Haksham_peer-evaluation)

Please refer to the SonarCloud report above for a deeper analysis and insights into the quality of the codebase.

---