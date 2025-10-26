'use client'

import { useState, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, AlertTriangle, TrendingUp, Users, Globe, Clock } from 'lucide-react'

interface StatsData {
  totalVerified: number
  authenticCount: number
  counterfeitCount: number
  expiredCount: number
  todayVerified: number
  weeklyVerified: number
  monthlyVerified: number
  globalVerified: number
  averageConfidence: number
  topManufacturers: Array<{
    name: string
    count: number
    percentage: number
  }>
  recentActivity: Array<{
    id: string
    medicineName: string
    status: 'authentic' | 'counterfeit' | 'expired'
    timestamp: string
    location: string
  }>
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchStats = async () => {
      setIsLoading(true)
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      const mockStats: StatsData = {
        totalVerified: 125847,
        authenticCount: 124523,
        counterfeitCount: 89,
        expiredCount: 1235,
        todayVerified: 342,
        weeklyVerified: 2847,
        monthlyVerified: 12456,
        globalVerified: 2847392,
        averageConfidence: 98.7,
        topManufacturers: [
          { name: 'Pfizer Inc.', count: 15420, percentage: 12.3 },
          { name: 'Johnson & Johnson', count: 12890, percentage: 10.2 },
          { name: 'Novartis AG', count: 11234, percentage: 8.9 },
          { name: 'Roche Holding AG', count: 9876, percentage: 7.8 },
          { name: 'Merck & Co.', count: 8765, percentage: 7.0 }
        ],
        recentActivity: [
          {
            id: '1',
            medicineName: 'Paracetamol 500mg',
            status: 'authentic',
            timestamp: '2 minutes ago',
            location: 'New York, USA'
          },
          {
            id: '2',
            medicineName: 'Amoxicillin 250mg',
            status: 'authentic',
            timestamp: '5 minutes ago',
            location: 'London, UK'
          },
          {
            id: '3',
            medicineName: 'Ibuprofen 400mg',
            status: 'expired',
            timestamp: '8 minutes ago',
            location: 'Toronto, Canada'
          },
          {
            id: '4',
            medicineName: 'Aspirin 100mg',
            status: 'counterfeit',
            timestamp: '12 minutes ago',
            location: 'Sydney, Australia'
          },
          {
            id: '5',
            medicineName: 'Metformin 500mg',
            status: 'authentic',
            timestamp: '15 minutes ago',
            location: 'Berlin, Germany'
          }
        ]
      }
      
      setStats(mockStats)
      setIsLoading(false)
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-50 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authentic':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'counterfeit':
        return <XCircle className="w-4 h-4 text-destructive" />
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-warning" />
      default:
        return <Shield className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'authentic':
        return 'text-success'
      case 'counterfeit':
        return 'text-destructive'
      case 'expired':
        return 'text-warning'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Statistics</h2>
        <p className="text-gray-600">Real-time data on medicine verification across the platform</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-gray-600">Total Verified</span>
            </div>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalVerified.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">medicines verified</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-success" />
              <span className="text-sm font-medium text-gray-600">Authentic</span>
            </div>
            <div className="text-sm text-success font-semibold">
              {((stats.authenticCount / stats.totalVerified) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-3xl font-bold text-success mb-1">
            {stats.authenticCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">verified authentic</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-6 h-6 text-destructive" />
              <span className="text-sm font-medium text-gray-600">Counterfeit</span>
            </div>
            <div className="text-sm text-destructive font-semibold">
              {((stats.counterfeitCount / stats.totalVerified) * 100).toFixed(2)}%
            </div>
          </div>
          <div className="text-3xl font-bold text-destructive mb-1">
            {stats.counterfeitCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">counterfeit detected</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <span className="text-sm font-medium text-gray-600">Expired</span>
            </div>
            <div className="text-sm text-warning font-semibold">
              {((stats.expiredCount / stats.totalVerified) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-3xl font-bold text-warning mb-1">
            {stats.expiredCount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">expired medicines</div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-900">Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.todayVerified.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">verifications today</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-900">This Week</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.weeklyVerified.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">verifications this week</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-900">Global</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.globalVerified.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">total global verifications</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
              <div className="flex items-center space-x-3">
                {getStatusIcon(activity.status)}
                <div>
                  <div className="font-medium text-gray-900">{activity.medicineName}</div>
                  <div className="text-sm text-gray-600">{activity.location}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                </div>
                <div className="text-sm text-gray-600">{activity.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
