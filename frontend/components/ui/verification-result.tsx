'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Calendar,
  Hash,
  Building,
  Package,
  Download,
  Share2,
  Activity,
  Layers,
  ShoppingCart,
  BookOpen,
} from 'lucide-react'

type VerificationStatus = 'authentic' | 'counterfeit' | 'expired' | 'unknown' | 'sold'

interface VerificationDetails {
  local_hash_prefix?: string | null
  identity_hash_prefix?: string | null
  hash_candidates?: string[]
  onchain_hash_prefix?: string | null
  method?: string
}

interface OpenFdaData {
  brand_name?: string
  manufacturer?: string
  purpose?: string
  warnings?: string
  dosage?: string
}

interface VerificationResultData {
  status: VerificationStatus
  medicineName: string
  batchNumber: string
  manufacturer: string
  expiryDate: string
  verificationDate: string
  confidence: number
  blockchainHash?: string | null
  additionalInfo?: string
  availability?: string
  ndc?: string
  sold?: boolean
  sold_at?: string | null
  buyer?: string | null
  aiSummary?: string
  verificationDetails?: VerificationDetails
  openfda?: OpenFdaData
}

interface VerificationResultProps {
  result: VerificationResultData
  onNewVerification: () => void
}

export default function VerificationResult({ result, onNewVerification }: VerificationResultProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getStatusConfig = () => {
    switch (result.status) {
      case 'authentic':
        return {
          icon: CheckCircle,
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          title: 'Medicine is Authentic',
          description: 'This medicine has been verified as genuine and safe to use.'
        }
      case 'counterfeit':
        return {
          icon: XCircle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/20',
          title: 'Counterfeit Detected',
          description: 'WARNING: This medicine appears to be counterfeit. Do not use.'
        }
      case 'expired':
        return {
          icon: AlertTriangle,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          title: 'Medicine Expired',
          description: 'This medicine has passed its expiry date and should not be used.'
        }
      case 'sold':
        return {
          icon: ShoppingCart,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100/80',
          borderColor: 'border-amber-200',
          title: 'Unit Already Dispensed',
          description: 'This specific unit has been recorded as sold. Avoid purchasing it again.'
        }
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Unable to Verify',
          description: 'We could not verify this medicine. Please check the details and try again.'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const handleDownload = () => {
    const reportData = {
      medicineName: result.medicineName,
      batchNumber: result.batchNumber,
      manufacturer: result.manufacturer,
      expiryDate: result.expiryDate,
      status: result.status,
      verificationDate: result.verificationDate,
      confidence: result.confidence,
      availability: result.availability,
      sold: result.sold,
      sold_at: result.sold_at,
      buyer: result.buyer,
      ndc: result.ndc,
      aiSummary: result.aiSummary,
      verificationDetails: result.verificationDetails,
      openfda: result.openfda,
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medicine-verification-${result.batchNumber}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Medicine Verification Result',
        text: `Medicine: ${result.medicineName}\nStatus: ${statusConfig.title}\nBatch: ${result.batchNumber}\nAvailability: ${result.availability ?? 'Unknown'}`,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Medicine: ${result.medicineName}\nStatus: ${statusConfig.title}\nBatch: ${result.batchNumber}\nAvailability: ${result.availability ?? 'Unknown'}\nVerified: ${result.verificationDate}`
      )
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      {/* Status Header */}
      <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg p-6 mb-6`}>
        <div className="flex items-center space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 ${statusConfig.bgColor} rounded-full flex items-center justify-center`}>
            <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${statusConfig.color}`}>
              {statusConfig.title}
            </h2>
            <p className="text-gray-600 mt-1">
              {statusConfig.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Confidence</div>
            <div className={`text-2xl font-bold ${statusConfig.color}`}>
              {Number.isFinite(result.confidence) ? `${result.confidence}%` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Package className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-sm text-gray-600">Medicine Name</div>
              <div className="font-semibold text-gray-900">{result.medicineName}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Hash className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-sm text-gray-600">Batch Number</div>
              <div className="font-semibold text-gray-900">{result.batchNumber}</div>
            </div>
          </div>

          {result.ndc && (
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-sm text-gray-600">Product NDC</div>
                <div className="font-semibold text-gray-900">{result.ndc}</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Building className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-sm text-gray-600">Manufacturer</div>
              <div className="font-semibold text-gray-900">{result.manufacturer}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-sm text-gray-600">Expiry Date</div>
              <div className="font-semibold text-gray-900">{result.expiryDate}</div>
            </div>
          </div>

          {result.availability && (
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-sm text-gray-600">Availability</div>
                <div className="font-semibold text-gray-900">{result.availability}</div>
                {result.buyer && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Buyer: {result.buyer}
                  </div>
                )}
                {result.sold_at && (
                  <div className="text-xs text-gray-500">
                    Sold on: {result.sold_at}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Blockchain Verification */}
      {result.blockchainHash && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-900">Blockchain Verified</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              On-chain hash prefix:{' '}
              <code className="bg-white px-2 py-1 rounded text-xs">
                {result.blockchainHash}
              </code>
            </div>
            <div>Verified on: {result.verificationDate}</div>
            {result.verificationDetails?.method && (
              <div className="text-xs text-gray-500">
                Method: {result.verificationDetails.method}
              </div>
            )}
            {result.verificationDetails?.hash_candidates && (
              <div className="text-xs text-gray-500">
                Local hash candidates:{' '}
                {result.verificationDetails.hash_candidates
                  .filter(Boolean)
                  .map((hash, idx) => `${idx + 1}: ${hash}`)
                  .join(' | ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Summary */}
      {result.aiSummary && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Layers className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-900">AI Summary</span>
          </div>
          <p className="text-sm text-gray-700">{result.aiSummary}</p>
        </div>
      )}

      {/* OpenFDA Details */}
      {(result.openfda?.purpose ||
        result.openfda?.dosage ||
        result.openfda?.warnings) && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-900">OpenFDA Highlights</span>
          </div>
          {result.openfda?.purpose && (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Purpose</div>
              <p className="text-sm text-gray-700">{result.openfda.purpose}</p>
            </div>
          )}
          {result.openfda?.dosage && (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Dosage</div>
              <p className="text-sm text-gray-700">{result.openfda.dosage}</p>
            </div>
          )}
          {result.openfda?.warnings && (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Warnings</div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {result.openfda.warnings}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Additional Information */}
      {result.additionalInfo && !result.aiSummary && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Additional Information</h3>
          <p className="text-sm text-gray-600">{result.additionalInfo}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onNewVerification}
          className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
        >
          <Package className="w-5 h-5" />
          <span>Verify Another Medicine</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center justify-center space-x-2 border-2 border-primary text-primary py-3 px-6 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Download Report</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center space-x-2 border-2 border-gray-200 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  )
}
