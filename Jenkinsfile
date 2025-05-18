pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
	echo "great test"
      }
    }
    stage('Test') {
      parallel {
        stage('Test On Windows') {
          steps {
            echo "Running tests on Windows"
          }
        }
        stage('Test On Linux') {
          steps {
            echo "Running tests on Linux"
          }
      }
    }
    stage('Confirm Deploy to staging') {
      steps {
        echo "deployyyyy"
        }
      }
    }
    stage('Deploy to Staging') {
      steps {
        echo "Deploying to staging..."
      }
    }
    stage('Confirm Deploy to production') {
      steps {
        timeout(time: 60, unit: 'SECONDS') {
          input(message: 'Okay to Deploy?', ok: 'Let\'s Do it!')
        }
      }
    }
    stage('Deploy to Production') {
      steps {
        echo "Deploying to production..."
      }
    } 
  }
  post {
    success {
      echo "build succeeded"
    }
    failure {
      echo "Build failed"
    }
  }
}
