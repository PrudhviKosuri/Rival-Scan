# ACIA - AI-Powered Business Intelligence Platform

🚀 **A comprehensive full-stack AI-powered business intelligence platform that provides real-time analysis, market insights, and competitive intelligence using Google's Gemini AI.**

## 🌟 Features

- **🔍 Company Analysis**: Deep dive into company overviews, financials, and market positioning
- **📊 Market Intelligence**: Real-time market signals, trends, and competitive analysis  
- **💰 Financial Insights**: Revenue analysis, pricing changes, and financial performance tracking
- **🚀 Product Monitoring**: Track product launches, feature updates, and market expansion
- **📈 Sentiment Analysis**: Monitor brand sentiment and market perception
- **📋 Documentation Hub**: Centralized documentation and reports
- **⚡ Real-time Processing**: Background job processing with live status updates
- **🤖 AI-Powered**: Leverages Google Gemini AI for dynamic, intelligent analysis

## 🏗️ Architecture

### Backend (`FINALAGENTATHON/`)
- **FastAPI** orchestrator with RESTful API endpoints
- **Google Gemini AI** integration for intelligent analysis
- **SQLite** for job management and data persistence
- **Background task processing** for scalable analysis jobs
- **Modular agent architecture** for different analysis types

### Frontend (`FINAL FRONTEND ACIA/`)
- **React + TypeScript** with modern UI components
- **Vite** for fast development and building
- **Tailwind CSS** for responsive, beautiful design
- **Real-time job status tracking** and progress monitoring
- **Multi-tab analysis dashboard** with dynamic data visualization

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+** 
- **Google API Key** (Gemini AI access)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd FINALAGENTATHON
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Google API key
   ```

5. **Start the backend server:**
   ```bash
   python -m uvicorn core.orchestrator:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd "FINAL FRONTEND ACIA"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173 (or the port shown in terminal)
   ```

## 📚 API Documentation

### Core Endpoints

#### Analysis Management
- `POST /api/analysis/create` - Create new analysis job
- `GET /api/jobs/{job_id}/status` - Get job status and progress

#### Analysis Results  
- `GET /api/analysis/{job_id}/overview` - Company overview and basic info
- `GET /api/analysis/{job_id}/offerings` - Product launches and pricing changes
- `GET /api/analysis/{job_id}/market-signals` - Market trends and signals
- `GET /api/analysis/{job_id}/sentiment` - Brand sentiment analysis
- `GET /api/analysis/{job_id}/documentation` - Generated reports and docs

#### Utility
- `GET /health` - Health check endpoint
- `GET /api/jobs` - List all jobs

### Example Usage

```bash
# Create analysis job
curl -X POST "http://localhost:8000/api/analysis/create" \
  -H "Content-Type: application/json" \
  -d '{"domain": "www.tesla.com", "competitor": "Tesla"}'

# Check job status  
curl "http://localhost:8000/api/jobs/{job_id}/status"

# Get analysis results
curl "http://localhost:8000/api/analysis/{job_id}/overview"
```

## 🔧 Configuration

### Environment Variables

**Backend (`.env`):**
```env
GOOGLE_API_KEY=your_google_api_key_here
ORCHESTRATOR_PORT=8000
ORCHESTRATOR_HOST=0.0.0.0
ORCHESTRATOR_DB=orchestrator_context.db
```

**Frontend:**
- No environment variables required for basic setup
- Backend API URL is automatically detected

## 🛠️ Development

### Backend Development

**Project Structure:**
```
FINALAGENTATHON/
├── core/
│   ├── orchestrator.py      # Main FastAPI application
│   ├── config.py           # Configuration management
│   ├── gemini_client.py    # Gemini AI integration
│   ├── storage.py          # Database operations
│   └── context_builder.py  # Context management
├── agents/
│   └── agent_service.py    # Agent orchestration
└── requirements.txt        # Python dependencies
```

**Key Technologies:**
- **FastAPI**: Modern, fast web framework for APIs
- **Google Gemini**: Advanced AI for content generation
- **SQLite**: Lightweight database for job management
- **Pydantic**: Data validation and serialization
- **Uvicorn**: ASGI server for production deployment

### Frontend Development

**Project Structure:**
```
FINAL FRONTEND ACIA/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API integration
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── package.json          # Node.js dependencies
```

**Key Technologies:**
- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing

## 🔍 Testing

### Backend Testing
```bash
cd FINALAGENTATHON
python -m pytest tests/
```

### Frontend Testing  
```bash
cd "FINAL FRONTEND ACIA"
npm test
```

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# Create test analysis
curl -X POST "http://localhost:8000/api/analysis/create" \
  -H "Content-Type: application/json" \
  -d '{"domain": "www.example.com", "competitor": "Example Inc"}'
```

## 🚢 Deployment

### Backend Deployment

**Using Docker:**
```bash
cd FINALAGENTATHON
docker build -t acia-backend .
docker run -p 8000:8000 --env-file .env acia-backend
```

**Using Production Server:**
```bash
pip install gunicorn
gunicorn core.orchestrator:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Deployment

**Build for production:**
```bash
cd "FINAL FRONTEND ACIA"
npm run build
```

**Deploy static files:**
- Upload `dist/` folder to your web server
- Configure server to serve `index.html` for all routes (SPA)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`  
5. **Open a Pull Request**

### Development Guidelines

- **Backend**: Follow PEP 8 Python style guide
- **Frontend**: Use TypeScript and follow React best practices
- **Commits**: Use conventional commit format
- **Testing**: Add tests for new features
- **Documentation**: Update README and API docs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub for bug reports
- **API Reference**: Visit `/docs` endpoint when backend is running
- **Community**: Join our discussions in GitHub Discussions

## 🙏 Acknowledgments

- **Google Gemini AI** for providing advanced AI capabilities
- **FastAPI** for the excellent web framework
- **React Team** for the robust UI library
- **Tailwind CSS** for beautiful, responsive design utilities

---

**Built with ❤️ by the ACIA Team**

🌟 **Star this repo if you find it helpful!**
