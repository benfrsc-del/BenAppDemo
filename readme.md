# NSW Planning Project Manager

A specialized project management application designed for NSW planning consultants to track development applications, manage client projects, and monitor council approval processes.

## Features

- **Project Dashboard**: Overview of all active projects with key metrics
- **Status Tracking**: Real-time monitoring of DA submissions and approvals
- **Council Integration**: Track projects across different NSW councils
- **Client Management**: Organize projects by client and location
- **Timeline Management**: Monitor submission dates and decision deadlines
- **Search & Filter**: Quickly find projects by status, client, or council

## Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BenAppDemo.git
cd BenAppDemo
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
BenAppDemo/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Main dashboard page
├── package.json        # Dependencies and scripts
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

## Development Roadmap

- [ ] Add project creation and editing forms
- [ ] Implement document management system
- [ ] Integrate with NSW Planning Portal APIs
- [ ] Add client portal functionality
- [ ] Implement task management within projects
- [ ] Add reporting and analytics features
- [ ] Mobile app development

## Contributing

This is a demo application. For production use, consider adding:
- User authentication
- Database integration
- API endpoints
- Enhanced security measures

## License

This project is for demonstration purposes.