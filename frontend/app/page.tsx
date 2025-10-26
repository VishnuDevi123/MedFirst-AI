'use client'

import { useState } from 'react'
import Header from '@/components/ui/header'
import Hero from '@/components/ui/hero'
import Scanner from '@/components/ui/scanner'
import ManualEntry from '@/components/ui/manual-entry'
import VerificationResult from '@/components/ui/verification-result'
import Footer from '@/components/ui/footer'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5050'

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

interface UiVerificationResult {
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

interface ApiVerificationResponse {
  object_id: string
  batch_id: string
  ndc: string
  manufacturer: string
  expiry: string
  sold: boolean
  sold_at: string | null
  buyer: string | null
  availability: string
  verified: boolean
  verification_details: VerificationDetails
  openfda: OpenFdaData
  ai_summary: string
}

export default function Home() {
  const [verificationResult, setVerificationResult] = useState<UiVerificationResult | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const extractObjectId = (rawValue: string | null | undefined) => {
    if (!rawValue) return null
    const trimmed = rawValue.trim()
    if (!trimmed) return null

    try {
      const url = new URL(trimmed)
      const segments = url.pathname.split('/').filter(Boolean)
      return segments.pop() ?? null
    } catch {
      return trimmed
    }
  }

  const mapResponseToUi = (data: ApiVerificationResponse): UiVerificationResult => {
    const nowIso = new Date().toISOString()
    const expiryDate = data.expiry ? new Date(data.expiry) : null
    const isExpired = expiryDate ? expiryDate.getTime() < Date.now() : false
    const status: VerificationStatus = !data.verified
      ? 'counterfeit'
      : isExpired
      ? 'expired'
      : data.sold
      ? 'sold'
      : 'authentic'

    const confidence =
      status === 'authentic'
        ? 96
        : status === 'sold'
        ? 88
        : status === 'expired'
        ? 70
        : 35

    const manufacturerDisplay =
      data.manufacturer ?? data.openfda?.manufacturer ?? 'Unknown manufacturer'

    return {
      status,
      medicineName: data.openfda?.brand_name ?? 'Unknown medicine',
      batchNumber: data.batch_id ?? data.object_id ?? 'Unknown batch',
      manufacturer: manufacturerDisplay,
      expiryDate: data.expiry ?? 'Unknown expiry',
      verificationDate: nowIso,
      confidence,
      blockchainHash: data.verification_details?.onchain_hash_prefix ?? null,
      additionalInfo: data.ai_summary,
      availability: data.availability,
      ndc: data.ndc,
      sold: data.sold,
      sold_at: data.sold_at,
      buyer: data.buyer,
      aiSummary: data.ai_summary,
      verificationDetails: data.verification_details,
      openfda: data.openfda,
    }
  }

  const verifyObjectId = async (rawValue: string) => {
    const objectId = extractObjectId(rawValue)
    if (!objectId) {
      setErrorMessage('Could not read a valid object ID from the scan.')
      return
    }

    setIsVerifying(true)
    setErrorMessage(null)
    setVerificationResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/verify/${objectId}`)
      if (!response.ok) {
        const message = response.status === 404
          ? 'Batch not found on the blockchain.'
          : 'Verification service returned an error.'
        throw new Error(message)
      }

      const data: ApiVerificationResponse = await response.json()
      setVerificationResult(mapResponseToUi(data))
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationResult(null)
      setErrorMessage(
        error instanceof Error ? error.message : 'Unexpected verification error.'
      )
    } finally {
      setIsVerifying(false)
    }
  }

  const handleScanResult = (result: string) => {
    verifyObjectId(result)
  }

  const handleManualVerification = async (objectId: string) => {
    await verifyObjectId(objectId)
  }

  const handleNewVerification = () => {
    setVerificationResult(null)
    setErrorMessage(null)
  }

  const handleError = (error: string) => {
    console.error('Scanner error:', error)
    setErrorMessage(error)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <Hero />
        
        {/* Verification Section */}
        <section id="scan" className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {isVerifying && (
              <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden />
                <span className="text-sm font-medium">
                  Verifying medicine details on-chain and with OpenFDA…
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            {!verificationResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Scanner onScanResult={handleScanResult} onError={handleError} />
                <ManualEntry onVerify={handleManualVerification} />
              </div>
            ) : (
              <VerificationResult 
                result={verificationResult} 
                onNewVerification={handleNewVerification} 
              />
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Simple, fast, and secure medicine verification in just a few steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Scan or Enter</h3>
                <p className="text-gray-600">
                  Scan the QR code on your medicine package or manually enter the details
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Analysis</h3>
                <p className="text-gray-600">
                  Our AI system analyzes the medicine against our secure blockchain database
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Results</h3>
                <p className="text-gray-600">
                  Receive instant verification results with detailed authenticity information
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About MedTrust AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to eliminate counterfeit drugs and protect patients worldwide. 
              Our blockchain-powered verification system ensures every medicine is authentic and safe.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
