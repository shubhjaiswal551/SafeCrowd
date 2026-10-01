# SafeCrowd — Real-Time Crowd Anomaly Detection & Surveillance

SafeCrowd is an end-to-end computer vision and real-time security monitoring platform engineered for high-density public venues, transit hubs, and commercial centers. It detects rapid crowd surges, bottlenecks, counter-flow movements, and erratic dispersal before they escalate into stampedes or security incidents.

---

## Repository Structure

```
SafeCrowd/
├── backend/                  # Python Computer Vision & ML Pipeline
│   ├── best.pt              # Trained YOLO detection model weights
│   ├── best.onnx            # ONNX-optimized model export
│   └── ...                  # Video inference & WebSocket pipeline
│
├── frontend/                 # Security Operations Center (SOC) Web Console
│   ├── src/                 # React 19 + TypeScript + TailwindCSS
│   │   ├── components/      # Tactical HUD, CameraPanels, Triage, Heatmap
│   │   ├── context/         # Auth & Session state
│   │   ├── pages/           # Dashboard, CameraFeeds, Alerts, IncidentLog
│   │   └── lib/             # Firebase Auth & Web Audio alarm engine
│   └── public/              # Optical video feeds & assets
│
└── README.md
```

---

## Frontend Setup & Execution

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## Key Features

- **Multi-Camera Tactical HUD**: 2x2 Matrix & Focus Feed views with real-time vector bounding boxes and telemetry.
- **Dynamic Density Matrix**: 5×5 spatial concentration heatmap grid.
- **Incident Alert Triage**: Audio alert engine with mute controls, priority categorization, and batch acknowledgement.
- **Evidence Snapshot Inspection**: Forensic frame freeze modal with timestamped metadata and operator action dispatch.
- **Cryptographic Audit Log**: Searchable incident table with CSV export for compliance reporting.
