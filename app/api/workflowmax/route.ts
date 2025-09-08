// app/api/workflowmax/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface WorkflowMaxConfig {
  baseUrl: string
  accessToken: string
  organizationId: string
}

interface WorkflowMaxJob {
  ID: string
  n: string // name
  Description: string
  State: 'Planned' | 'InProgress' | 'Completed'
  StartDate: string
  DueDate: string
  Client: {
    ID: string
    n: string
  }
  Contact?: {
    ID: string
    n: string
  }
  Manager?: {
    ID: string
    n: string
  }
  Tasks?: Array<{
    ID: string
    n: string
    Description: string
    EstimatedMinutes: number
    ActualMinutes: number
    Completed: boolean
    DueDate?: string
  }>
}

interface PlanningProject {
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
  workflowMaxJobId?: string
  lastSyncDate?: string
}

class WorkflowMaxAPI {
  private config: WorkflowMaxConfig

  constructor(config: WorkflowMaxConfig) {
    this.config = config
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.config.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'account_id': this.config.organizationId,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`WorkflowMax API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getJobs(): Promise<WorkflowMaxJob[]> {
    try {
      const response = await this.makeRequest('/v2/jobs')
      return response.jobs || []
    } catch (error) {
      console.error('Error fetching WorkflowMax jobs:', error)
      return []
    }
  }

  async getJob(jobId: string): Promise<WorkflowMaxJob | null> {
    try {
      const response = await this.makeRequest(`/v2/jobs/${jobId}`)
      return response.job || null
    } catch (error) {
      console.error(`Error fetching WorkflowMax job ${jobId}:`, error)
      return null
    }
  }

  async createJob(jobData: Partial<WorkflowMaxJob>): Promise<WorkflowMaxJob | null> {
    try {
      const response = await this.makeRequest('/v2/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      })
      return response.job || null
    } catch (error) {
      console.error('Error creating WorkflowMax job:', error)
      return null
    }
  }

  async updateJob(jobId: string, jobData: Partial<WorkflowMaxJob>): Promise<WorkflowMaxJob | null> {
    try {
      const response = await this.makeRequest(`/v2/jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
      })
      return response.job || null
    } catch (error) {
      console.error(`Error updating WorkflowMax job ${jobId}:`, error)
      return null
    }
  }

  async getClients() {
    try {
      const response = await this.makeRequest('/client.api/list')
      return response.clients || []
    } catch (error) {
      console.error('Error fetching WorkflowMax clients:', error)
      return []
    }
  }
}

// Transform WorkflowMax job to Planning Project
function transformWorkflowMaxJob(job: WorkflowMaxJob): PlanningProject {
  const calculateDaysRemaining = (dueDate: string): number => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  // Map WorkflowMax states to planning statuses
  const statusMap: Record<string, 'submitted' | 'review' | 'approved' | 'conditional'> = {
    'Planned': 'submitted',
    'InProgress': 'review', 
    'Completed': 'approved'
  }

  // Extract planning-specific info from description or custom fields
  const getDANumber = (description: string): string => {
    const daMatch = description.match(/DA[\/\-]?\d{4}[\/\-]?\d+/i)
    return daMatch ? daMatch[0] : ''
  }

  const getCouncil = (description: string): string => {
    const councilMatch = description.match(/([\w\s]+)\s+council/i)
    return councilMatch ? `${councilMatch[1]} Council` : ''
  }

  const getAddress = (description: string): string => {
    const addressMatch = description.match(/(?:at|@)\s+([^,\n]+)/i)
    return addressMatch ? addressMatch[1].trim() : ''
  }

  const getValue = (description: string): number => {
    const valueMatch = description.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i)
    return valueMatch ? parseInt(valueMatch[1].replace(/,/g, '')) : 0
  }

  return {
    id: job.ID,
    name: job.n,
    client: job.Client?.n || 'Unknown Client',
    address: getAddress(job.Description),
    council: getCouncil(job.Description),
    status: statusMap[job.State] || 'submitted',
    submissionDate: job.StartDate.split('T')[0],
    expectedDecision: job.DueDate.split('T')[0],
    daysRemaining: calculateDaysRemaining(job.DueDate),
    value: getValue(job.Description),
    description: job.Description,
    daNumber: getDANumber(job.Description),
    contactPerson: job.Contact?.n,
    workflowMaxJobId: job.ID,
    lastSyncDate: new Date().toISOString()
  }
}

// Transform Planning Project to WorkflowMax job
function transformPlanningProject(project: PlanningProject): Partial<WorkflowMaxJob> {
  const stateMap: Record<string, 'Planned' | 'InProgress' | 'Completed'> = {
    'submitted': 'Planned',
    'review': 'InProgress',
    'approved': 'Completed',
    'conditional': 'InProgress'
  }

  // Create rich description with planning details
  const description = [
    project.description || '',
    project.address ? `Address: ${project.address}` : '',
    project.council ? `Council: ${project.council}` : '',
    project.daNumber ? `DA Number: ${project.daNumber}` : '',
    project.value ? `Project Value: $${project.value.toLocaleString()}` : '',
  ].filter(Boolean).join('\n')

  return {
    n: project.name,
    Description: description,
    State: stateMap[project.status] || 'Planned',
    StartDate: project.submissionDate,
    DueDate: project.expectedDecision,
  }
}

// API Route Handlers
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  // Get WorkflowMax credentials from environment
  const config: WorkflowMaxConfig = {
    baseUrl: process.env.WORKFLOWMAX_API_URL || 'https://api.workflowmax2.com',
    accessToken: process.env.WORKFLOWMAX_ACCESS_TOKEN || '',
    organizationId: process.env.WORKFLOWMAX_ORG_ID || ''
  }

  if (!config.accessToken || !config.organizationId) {
    return NextResponse.json(
      { error: 'WorkflowMax credentials not configured' },
      { status: 500 }
    )
  }

  const api = new WorkflowMaxAPI(config)

  try {
    switch (action) {
      case 'sync':
        // Fetch all jobs from WorkflowMax and convert to planning projects
        const jobs = await api.getJobs()
        const planningProjects = jobs
          .filter(job => 
            // Filter for planning-related jobs (you can customize this)
            job.Description.toLowerCase().includes('da') ||
            job.Description.toLowerCase().includes('development') ||
            job.Description.toLowerCase().includes('planning') ||
            job.Description.toLowerCase().includes('council')
          )
          .map(transformWorkflowMaxJob)

        return NextResponse.json({ 
          success: true, 
          projects: planningProjects,
          totalJobs: jobs.length,
          planningJobs: planningProjects.length
        })

      case 'clients':
        const clients = await api.getClients()
        return NextResponse.json({ success: true, clients })

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('WorkflowMax API error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to WorkflowMax' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, project } = body

  const config: WorkflowMaxConfig = {
    baseUrl: process.env.WORKFLOWMAX_API_URL || 'https://api.workflowmax2.com',
    accessToken: process.env.WORKFLOWMAX_ACCESS_TOKEN || '',
    organizationId: process.env.WORKFLOWMAX_ORG_ID || ''
  }

  if (!config.accessToken || !config.organizationId) {
    return NextResponse.json(
      { error: 'WorkflowMax credentials not configured' },
      { status: 500 }
    )
  }

  const api = new WorkflowMaxAPI(config)

  try {
    switch (action) {
      case 'create':
        const jobData = transformPlanningProject(project)
        const newJob = await api.createJob(jobData)
        
        if (newJob) {
          const createdProject = transformWorkflowMaxJob(newJob)
          return NextResponse.json({ 
            success: true, 
            project: createdProject 
          })
        } else {
          throw new Error('Failed to create job in WorkflowMax')
        }

      case 'update':
        if (!project.workflowMaxJobId) {
          return NextResponse.json(
            { error: 'Project is not linked to WorkflowMax' },
            { status: 400 }
          )
        }

        const updateData = transformPlanningProject(project)
        const updatedJob = await api.updateJob(project.workflowMaxJobId, updateData)
        
        if (updatedJob) {
          const updatedProject = transformWorkflowMaxJob(updatedJob)
          return NextResponse.json({ 
            success: true, 
            project: updatedProject 
          })
        } else {
          throw new Error('Failed to update job in WorkflowMax')
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('WorkflowMax API error:', error)
    return NextResponse.json(
      { error: 'Failed to sync with WorkflowMax' },
      { status: 500 }
    )
  }
}
