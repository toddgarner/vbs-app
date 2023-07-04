import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "@remix-run/react";

export default function ScanPage() {
  const [scanResult, setScanResult] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    function onScanSuccess(decodedText: string) {
      // handle the scanned code as you like, for example:
      html5QrcodeScanner.clear();
      setScanResult(decodedText);
      navigate(`/registrants/${decodedText}`);
      return decodedText;
    }

    function onScanFailure(error: string) {
      // handle scan failure, usually better to ignore and keep scanning.
      // for example:
      return `Code scan error = ${error}`;
    }
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 5,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      /* verbose= */ false
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    // Clean up the scanner when the component is unmounted
    return () => {
      html5QrcodeScanner.clear();
    };
  }, []);

  return (
    <div>
      {scanResult === "" ? (
        <div id="reader"></div>
      ) : (
        <div>
          <p>Scan result: {scanResult}</p>
        </div>
      )}
    </div>
  );
}
