'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  FileText, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save
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
  description?: string
  daNumber?: string
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
}

const NSW_COUNCILS = [
  'Albury City Council',
  'Armidale Regional Council',
  'Ballina Shire Council',
  'Bathurst Regional Council',
  'Blacktown City Council',
  'Blue Mountains City Council',
  'City of Sydney',
  'Cumberland Council',
  'Fairfield City Council',
  'Hawkesbury City Council',
  'Hornsby Shire Council',
  'Liverpool City Council',
  'Newcastle City Council',
  'Northern Beaches Council',
  'Parramatta City Council',
  'Penrith City Council',
  'Randwick City Council',
  'Sutherland Shire Council',
  'Waverley Council',
  'Willoughby City Council',
  'Wollongong City Council'
]

const calculateDaysRemaining = (expectedDecision: string): number => {
  const today = new Date()
  const decisionDate = new Date(expectedDecision)
  const diffTime = decisionDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// Mecone Logo Component
const MeconeLogo = () => (
  <div className="flex items-center gap-2">
    <div className="flex gap-1">
      <div className="w-2 h-6 bg-mecone-lawn transform -skew-x-12"></div>
      <div className="w-2 h-6 bg-mecone-lawn transform -skew-x-12 opacity-70"></div>
      <div className="w-2 h-6 bg-mecone-lawn transform -skew-x-12 opacity-40"></div>
    </div>
    <span className="text-2xl font-semibold text-mecone-forest">Mecone</span>
  </div>
)

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)

  useEffect(() => {
    const savedProjects = localStorage.getItem('meconePlanningProjects')
    if (savedProjects) {
      const parsed = JSON.parse(savedProjects)
      const updatedProjects = parsed.map((project: Project) => ({
        ...project,
        daysRemaining: calculateDaysRemaining(project.expectedDecision)
      }))
      setProjects(updatedProjects)
    } else {
      const sampleProjects: Project[] = [
        {
          id: '1',
          name: 'Residential Development - 15 Units',
          client: 'Sunset Developments',
          address: '123 Main Street, Parramatta',
          council: 'Parramatta City Council',
          status: 'review',
          submissionDate: '2024-08-15',
          expectedDecision: '2024-10-15',
          daysRemaining: calculateDaysRemaining('2024-10-15'),
          value: 450000,
          description: 'Multi-story residential development with basement parking',
          daNumber: 'DA/2024/0123',
          contactPerson: 'John Smith',
          contactEmail: 'john@sunsetdev.com',
          contactPhone: '0412 345 678'
        }
      ]
      setProjects(sampleProjects)
      localStorage.setItem('meconePlanningProjects', JSON.stringify(sampleProjects))
    }
  }, [])

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('meconePlanningProjects', JSON.stringify(projects))
    }
  }, [projects])

  const filteredProjects = projects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.council.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.daNumber && project.daNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const addProject = (projectData: Omit<Project, 'id' | 'daysRemaining'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      daysRemaining: calculateDaysRemaining(projectData.expectedDecision)
    }
    setProjects([...projects, newProject])
    setIsAddingProject(false)
  }

  const updateProject = (updatedProject: Project) => {
    const updated = {
      ...updatedProject,
      daysRemaining: calculateDaysRemaining(updatedProject.expectedDecision)
    }
    setProjects(projects.map(p => p.id === updated.id ? updated : p))
    setEditingProject(null)
  }

  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id))
      setViewingProject(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'status-badge'
    switch (status) {
      case 'submitted':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'review':
        return `${baseClasses} bg-mecone-iris/20 text-mecone-purple`
      case 'approved':
        return `${baseClasses} bg-mecone-lawn/20 text-mecone-forest`
      case 'conditional':
        return `${baseClasses} bg-orange-100 text-orange-800`
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

  const ProjectForm = ({ 
    project, 
    onSubmit, 
    onCancel 
  }: { 
    project?: Project | null
    onSubmit: (project: Omit<Project, 'id' | 'daysRemaining'>) => void
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState({
      name: project?.name || '',
      client: project?.client || '',
      address: project?.address || '',
      council: project?.council || '',
      status: project?.status || 'submitted' as 'submitted' | 'review' | 'approved' | 'conditional',
      submissionDate: project?.submissionDate || new Date().toISOString().split('T')[0],
      expectedDecision: project?.expectedDecision || '',
      value: project?.value || 0,
      description: project?.description || '',
      daNumber: project?.daNumber || '',
      contactPerson: project?.contactPerson || '',
      contactEmail: project?.contactEmail || '',
      contactPhone: project?.contactPhone || ''
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!formData.name || !formData.client || !formData.expectedDecision) {
        alert('Please fill in all required fields')
        return
      }
      onSubmit(formData as Omit<Project, 'id' | 'daysRemaining'>)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-mecone-greenfield">
                {project ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Council
                  </label>
                  <select
                    value={formData.council}
                    onChange={(e) => setFormData({ ...formData, council: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  >
                    <option value="">Select Council</option>
                    {NSW_COUNCILS.map(council => (
                      <option key={council} value={council}>{council}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="conditional">Conditional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Date
                  </label>
                  <input
                    type="date"
                    value={formData.submissionDate}
                    onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Decision Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expectedDecision}
                    onChange={(e) => setFormData({ ...formData, expectedDecision: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Value ($)
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DA Number
                  </label>
                  <input
                    type="text"
                    value={formData.daNumber}
                    onChange={(e) => setFormData({ ...formData, daNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mecone-lawn"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={onCancel} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {project ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const ProjectDetails = ({ project, onClose, onEdit, onDelete }: {
    project: Project
    onClose: () => void
    onEdit: () => void
    onDelete: () => void
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-mecone-greenfield mb-2">{project.name}</h2>
              <span className={getStatusBadge(project.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(project.status)}
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-mecone-forest mb-2">Client Information</h3>
              <p className="text-gray-600 mb-1">{project.client}</p>
              {project.contactPerson && (
                <p className="text-sm text-gray-500">Contact: {project.contactPerson}</p>
              )}
              {project.contactEmail && (
                <p className="text-sm text-gray-500">Email: {project.contactEmail}</p>
              )}
              {project.contactPhone && (
                <p className="text-sm text-gray-500">Phone: {project.contactPhone}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-mecone-forest mb-2">Project Details</h3>
              <p className="text-gray-600 mb-1">{project.address}</p>
              <p className="text-sm text-gray-500">{project.council}</p>
              {project.daNumber && (
                <p className="text-sm text-gray-500">DA: {project.daNumber}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-mecone-forest mb-2">Timeline</h3>
              <p className="text-sm text-gray-500">
                Submitted: {new Date(project.submissionDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                Expected Decision: {new Date(project.expectedDecision).toLocaleDateString()}
              </p>
              <p className={`text-sm font-medium ${
                project.daysRemaining <= 7 ? 'text-red-600' : 
                project.daysRemaining <= 14 ? 'text-yellow-600' : 'text-mecone-lawn'
              }`}>
                {project.daysRemaining === 0 ? 'Decision due' : `${project.daysRemaining} days remaining`}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-mecone-forest mb-2">Value</h3>
              <p className="text-2xl font-bold text-mecone-greenfield">${project.value.toLocaleString()}</p>
            </div>
          </div>

          {project.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-mecone-forest mb-2">Description</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => onDelete()}
              className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button onClick={onEdit} className="btn-primary flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Project
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (viewingProject) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <MeconeLogo />
                <button 
                  onClick={() => setIsAddingProject(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>
          </header>
        </div>
        <ProjectDetails
          project={viewingProject}
          onClose={() => setViewingProject(null)}
          onEdit={() => {
            setEditingProject(viewingProject)
            setViewingProject(null)
          }}
          onDelete={() => deleteProject(viewingProject.id)}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <MeconeLogo />
            <button 
              onClick={() => setIsAddingProject(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-mecone-urbanzest/20 rounded-lg">
                <FileText className="w-6 h-6 text-mecone-forest" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
                <p className="text-2xl font-bold text-mecone-greenfield">{totalProjects}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-mecone-lawn/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-mecone-lawn" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Approved</h3>
                <p className="text-2xl font-bold text-mecone-greenfield">{approvedProjects}</p>
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
                <p className="text-2xl font-bold text-mecone-greenfield">{pendingProjects}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-mecone-iris/20 rounded-lg">
                <Users className="w-6 h-6 text-mecone-purple" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
                <p className="text-2xl font-bold text-mecone-greenfield">${(totalValue / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mecone-lawn focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mecone-lawn focus:border-transparent"
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

        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="card hover:shadow-md transition-shadow cursor-pointer hover:border-mecone-lawn"
              onClick={() => setViewingProject(project)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-mecone-greenfield">{project.name}</h3>
                    <span className={getStatusBadge(project.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(project.status)}
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-mecone-forest" />
                      <span>{project.client}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-mecone-forest" />
                      <span>{project.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-mecone-forest" />
                      <span>{project.council}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:items-end">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 text-mecone-forest" />
                    <span>Decision: {new Date(project.expectedDecision).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      project.daysRemaining <= 7 ? 'text-red-600' : 
                      project.daysRemaining <= 14 ? 'text-yellow-600' : 'text-mecone-lawn'
                    }`}>
                      {project.daysRemaining === 0 ? 'Decision due' : `${project.daysRemaining} days remaining`}
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
              <p>Try adjusting your search or filter criteria, or add your first project.</p>
              <button 
                onClick={() => setIsAddingProject(true)}
                className="btn-primary mt-4 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add Your First Project
              </button>
            </div>
          </div>
        )}
      </div>

      {isAddingProject && (
        <ProjectForm
          onSubmit={addProject}
          onCancel={() => setIsAddingProject(false)}
        />
      )}

      {editingProject && (
        <ProjectForm
          project={editingProject}
          onSubmit={(data) => updateProject({ ...editingProject, ...data })}
          onCancel={() => setEditingProject(null)}
        />
      )}
    </div>
  )
}
