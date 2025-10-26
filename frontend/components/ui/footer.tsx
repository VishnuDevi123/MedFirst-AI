import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">MedTrust AI</div>
              <div className="text-sm text-gray-400">Verify Your Medicine</div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-8 max-w-2xl mx-auto">
            Protecting patients from counterfeit drugs through AI-powered blockchain verification. 
            Verify medicine authenticity with confidence.
          </p>
          
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#scan" className="text-gray-400 hover:text-white transition-colors text-sm">
              Scan Medicine
            </a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">
              How It Works
            </a>
            <a href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">
              About
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Contact
            </a>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm">
              © 2024 MedTrust AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
