'use client'

import { useState } from 'react'
import { Shield, Scan, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'

export default function Hero() {
  const [isScanning, setIsScanning] = useState(false)

  const handleScanClick = () => {
    setIsScanning(true)
    // Scroll to scanner section
    document.getElementById('scanner-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="bg-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-8">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Blockchain-Verified Medicine Safety</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Verify Your Medicine in{' '}
            <span className="text-blue-600">Seconds</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Protect yourself and your loved ones from counterfeit drugs. Scan any medicine QR code to instantly verify authenticity using blockchain technology and AI-powered safety insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleScanClick}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Scan Medicine Now
            </button>
            
            <button
              onClick={() => document.getElementById('manual-entry')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              Learn More
            </button>
          </div>

          {/* Warning Message */}
          <div className="flex items-center justify-center space-x-2 text-red-600 text-lg font-medium">
            <AlertTriangle className="w-5 h-5" />
            <span>250,000+ deaths yearly from counterfeit drugs</span>
          </div>
        </div>
      </div>
    </section>
  )
}
