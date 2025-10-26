'use client'

import { useState, useRef, useEffect, useId } from 'react'
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  type Html5QrcodeResult,
} from 'html5-qrcode'
import {
  Scan,
  Camera,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
} from 'lucide-react'

interface ScannerProps {
  onScanResult: (result: string) => void
  onError: (error: string) => void
}

export default function Scanner({ onScanResult, onError }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [scanHint, setScanHint] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const html5QrRef = useRef<Html5Qrcode | null>(null)
  const regionId = `${useId()}-qr-reader`

  const stopScanning = async () => {
    const instance = html5QrRef.current
    if (instance) {
      try {
        await instance.stop()
      } catch (stopError) {
        // stop() throws if the camera was never started; ignore
        console.warn('Stop scanner warning:', stopError)
      }
      try {
        await instance.clear()
      } catch (clearError) {
        console.warn('Clear scanner warning:', clearError)
      }
      html5QrRef.current = null
    }

    setIsScanning(false)
  }

  useEffect(() => {
    return () => {
      void stopScanning()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDecode = (decodedText: string, _decodedResult: Html5QrcodeResult) => {
    const value = decodedText.trim()
    if (!value) {
      return
    }

    setLastResult(value)
    setScanHint(null)
    setErrorMessage(null)
    void stopScanning()
    onScanResult(value)
  }

  const handleDecodeError = (message: string) => {
    // html5-qrcode fires decode errors frequently; show a gentle hint once
    if (!scanHint) {
      setScanHint('Still searching for a clear scan… keep the code steady and centered.')
    }
    if (message?.includes('NotFoundException')) {
      return
    }
    setErrorMessage(message)
  }

  const startScanning = async () => {
    try {
      if (!html5QrRef.current) {
        html5QrRef.current = new Html5Qrcode(regionId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        })
      }

      await html5QrRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          rememberDevice: true,
        },
        handleDecode,
        handleDecodeError
      )

      setHasPermission(true)
      setIsScanning(true)
      setScanHint(null)
      setErrorMessage(null)
    } catch (error) {
      console.error('Error starting HTML5 QR scanner:', error)
      setHasPermission(false)
      setIsScanning(false)

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to access camera. Please allow camera permissions and try again.'

      setErrorMessage(message)
      onError(message)
    }
  }

  const handleScanClick = () => {
    if (isScanning) {
      void stopScanning()
    } else {
      void startScanning()
    }
  }

  const handleRescan = () => {
    setLastResult(null)
    setErrorMessage(null)
    setScanHint(null)
    void startScanning()
  }

  return (
    <div
      id="scanner-section"
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
          <Scan className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Scanner</h2>
        <p className="text-gray-600">
          Point your camera at the QR code on your medicine package
        </p>
      </div>

      {/* Camera Preview */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-6">
        <div
          id={regionId}
          className={`w-full ${isScanning ? 'h-64' : 'h-0'} overflow-hidden`}
        />

        {!isScanning && (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Camera className="w-16 h-16 text-gray-500 mb-2 mx-auto" />
              <p className="text-gray-600 text-sm">
                {lastResult
                  ? 'Scan complete. You can rescan another code.'
                  : 'Camera preview will appear here'}
              </p>
              {lastResult && (
                <div className="bg-gray-100 text-gray-800 text-xs px-3 py-2 rounded-lg break-all">
                  {lastResult}
                </div>
              )}
            </div>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-primary/80 border-dashed rounded-lg flex items-center justify-center bg-primary/5">
              <Scan className="w-10 h-10 text-primary animate-ping" />
            </div>
          </div>
        )}
      </div>

      {/* Permission Status */}
      {hasPermission === false && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive font-medium">Camera access denied</p>
          </div>
          <p className="text-destructive/80 text-sm mt-1">
            Please allow camera permission in your browser settings and refresh the page.
          </p>
        </div>
      )}

      {scanHint && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-700">
          {scanHint}
        </div>
      )}

      {errorMessage && !hasPermission && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-sm text-amber-700">
          {errorMessage}
        </div>
      )}

      {lastResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 text-sm text-emerald-700 flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <div className="font-semibold text-emerald-800">QR code captured</div>
            <div className="break-all text-xs text-emerald-700 mt-1">{lastResult}</div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">How to scan:</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Click &quot;Start Scanning&quot; to activate your camera</li>
          <li>2. Hold the QR code 10–15 cm in front of the lens</li>
          <li>3. Ensure the code fits inside the highlighted square</li>
          <li>4. The scan stops automatically once a code is detected</li>
        </ol>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleScanClick}
          className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            isScanning
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isScanning ? (
            <>
              <X className="w-5 h-5" />
              <span>Stop Scanning</span>
            </>
          ) : (
            <>
              <Scan className="w-5 h-5" />
              <span>Start Scanning</span>
            </>
          )}
        </button>

        <button
          onClick={() =>
            document
              .getElementById('manual-entry')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
          className="flex items-center justify-center space-x-2 border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <span>Manual Entry Instead</span>
        </button>

        {lastResult && (
          <button
            onClick={handleRescan}
            className="flex items-center justify-center space-x-2 border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Scan Another</span>
          </button>
        )}
      </div>
    </div>
  )
}
