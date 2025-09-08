'use client'

import { useState } from 'react'
import { 
  Calendar, 
  FileText, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Filter,
  Search
} from 'lucide-react'

interface Project {
  id: string
  name: string
  client: string
  address: string
  council: string
  status: 'submitted' | 'review' | 'approved' | 'conditional'
  submissionDate: string
  expectedDecision: string
  daysRemaining: number
  value: number
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Residential Development - 15 Units',
    client: 'Sunset Developments',
    address: '123 Main Street, Parramatta',
    council: 'Parramatta City Council',
    status: 'review',
    submissionDate: '2024-08-15',
    expectedDecision: '2024-09-30',
    daysRemaining: 22,
    value: 450000
  },
  {
    id: '2',
    name: 'Commercial Fit-out',
    client: 'Metro Retail Group',
    address: '456 George Street, Sydney',
    council: 'City of Sydney',
    status: 'approved',
    submissionDate: '2024-07-20',
    expectedDecision: '2024-09-05',
    daysRemaining: 0,
    value: 75000
  },
  {
    id: '3',
    name: 'Industrial Warehouse Extension',
    client: 'Logistics Australia',
    address: '789 Industrial Drive, Blacktown',
    council: 'Blacktown City Council',
    status: 'conditional',
    submissionDate: '2024-08-01',
    expectedDecision: '2024-09-15',
    daysRemaining: 7,
    value: 180000
  },
  {
    id: '4',
    name: 'Mixed Use Development',
    client: 'Urban Living Co',
    address: '321 High Street, Penrith',
    council: 'Penrith City Council',
    status: 'submitted',
    submissionDate: '2024-09-01',
    expectedDecision: '2024-10-15',
    daysRemaining: 37,
    value: 890000
  }
]

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.council.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const baseClasses = 'status-badge'
    switch (status) {
      case 'submitted':
        return `${baseClasses} status-submitted`
      case 'review':
        return `${baseClasses} status-review`
      case 'approved':
        return `${baseClasses} status-approved`
      case 'conditional':
        return `${baseClasses} status-conditional`
      default:
        return baseClasses
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4" />
      case 'review':
        return <AlertCircle className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'conditional':
        return <FileText className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const totalProjects = projects.length
  const approvedProjects = projects.filter(p => p.status === 'approved').length
  const pendingProjects = projects.filter(p => p.status === 'review' || p.status === 'submitted').length
  const totalValue = projects.reduce((sum, p) => sum + p.value, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">NSW Planning PM</h1>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Approved</h3>
                <p className="text-2xl font-bold text-gray-900">{approvedProjects}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <p className="text-2xl font-bold text-gray-900">{pendingProjects}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
                <p className="text-2xl font-bold text-gray-900">${(totalValue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-planning-blue focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-planning-blue focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="conditional">Conditional</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <span className={getStatusBadge(project.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(project.status)}
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{project.client}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{project.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{project.council}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:items-end">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Decision: {new Date(project.expectedDecision).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      project.daysRemaining <= 7 ? 'text-red-600' : 
                      project.daysRemaining <= 14 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {project.daysRemaining === 0 ? 'Decided' : `${project.daysRemaining} days remaining`}
                    </div>
                    <div className="text-sm text-gray-500">${project.value.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No projects found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}