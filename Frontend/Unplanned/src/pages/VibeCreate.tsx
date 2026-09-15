import { useState, useRef, type ChangeEvent, type FC, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle2,
  Compass,
  MapPin,
  Navigation,
  Radio,
  Sparkles,
  X,
} from "lucide-react";
import API from "../api/axios";
import { useToast } from "../context/ToastContext";
import type { SingleVibeResponse } from "../types/vibe";
import "./VibeCreate.css";

interface AlertState {
  type: "error" | "success";
  title: string;
  messages: string[];
}

interface CityPreset {
  name: string;
  lat: number;
  lng: number;
}

const CITY_PRESETS: CityPreset[] = [
  { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
];

const VibeCreate: FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate default start date: 2 hours from now formatted for datetime-local
  const getDefaultStartDate = () => {
    const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Quick GPS detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.warning("Geolocation is not supported by your browser.", "Location Notice");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        toast.info(
          `Coordinates acquired: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          "GPS Locked"
        );
      },
      (err) => {
        setIsDetectingLocation(false);
        toast.warning(
          "Could not retrieve exact GPS. Pick a city preset or enter manually.",
          "Location Notice"
        );
        console.warn("Geolocation error:", err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = (preset: CityPreset) => {
    setLatitude(preset.lat.toString());
    setLongitude(preset.lng.toString());
    if (!locationName) {
      setLocationName(preset.name);
    }
  };

  // Image handling
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    if (images.length + selectedFiles.length > 5) {
      toast.warning("Maximum of 5 images allowed per microadventure.", "Upload Limit");
      return;
    }

    const newFiles = [...images, ...selectedFiles].slice(0, 5);
    setImages(newFiles);

    // Generate previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    setImages(updatedImages);
    setPreviewUrls(updatedPreviews);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlert(null);

    // Client-side validations matching backend
    const errors: string[] = [];

    if (!title.trim()) {
      errors.push("Please provide a title for the microadventure.");
    } else if (title.trim().length < 3) {
      errors.push("Title must be at least 3 characters long.");
    }

    if (!description.trim()) {
      errors.push("Please write a brief description.");
    } else if (description.trim().length < 10) {
      errors.push("Description must be at least 10 characters long.");
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lngNum)) {
      errors.push("Please enter or detect valid latitude and longitude coordinates.");
    }

    if (!startDate) {
      errors.push("Start date and time is required.");
    } else {
      const selectedStart = new Date(startDate);
      if (selectedStart.getTime() < Date.now() - 5 * 60 * 1000) {
        errors.push("Start date cannot be in the past.");
      }
    }

    if (errors.length > 0) {
      setAlert({
        type: "error",
        title: "Please complete the required details",
        messages: errors,
      });
      toast.warning(errors[0], "Validation Notice");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      if (locationName.trim()) {
        formData.append("locationName", locationName.trim());
      }
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("startDate", new Date(startDate).toISOString());
      if (endDate) {
        formData.append("endDate", new Date(endDate).toISOString());
      }

      images.forEach((file) => {
        formData.append("image", file);
      });

      const response = await API.post<SingleVibeResponse>("/vibes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success(
          response.data.message || "Microadventure broadcasted live! Radar spark active.",
          "Vibe Created"
        );
        navigate("/vibes", { replace: true });
      }
    } catch (err: unknown) {
      setIsLoading(false);

      interface AxiosErrorResponse {
        response?: {
          status?: number;
          data?: {
            errors?: { msg: string }[];
            message?: string;
          };
        };
      }

      const axiosError = err as AxiosErrorResponse;
      const backendErrors = axiosError.response?.data?.errors;
      const singleMessage = axiosError.response?.data?.message;

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        const msgs = backendErrors.map((i) => i.msg);
        setAlert({
          type: "error",
          title: "Failed to Broadcast Vibe",
          messages: msgs,
        });
        toast.error(msgs.join(" • "), "Broadcast Error");
      } else if (singleMessage) {
        setAlert({
          type: "error",
          title: "Failed to Broadcast Vibe",
          messages: [singleMessage],
        });
        toast.error(singleMessage, "Broadcast Error");
      } else {
        const fallback = "Unable to connect to the server. Please check your connection.";
        setAlert({
          type: "error",
          title: "Connection Error",
          messages: [fallback],
        });
        toast.error(fallback, "Connection Error");
      }
    }
  };

  return (
    <div className="vibe-create-container">
      <div className="vibe-create-card" role="region" aria-labelledby="vibe-create-heading">
        {/* Seamless Ticket Waist Notches */}
        <div className="vibe-create-notch-left" aria-hidden="true" />
        <div className="vibe-create-notch-right" aria-hidden="true" />

        {/* Notched Top Header Tab */}
        <div className="vibe-create-header">
          <div className="vibe-create-kicker-group">
            <Radio size={15} className="vibe-create-kicker-icon" />
            <span className="vibe-create-kicker-text">Transmitter Permit</span>
          </div>
          <span className="vibe-create-step-badge">New Spark</span>
        </div>

        <div className="vibe-create-body">
          {/* Header Title Block */}
          <div className="vibe-create-title-block">
            <h1 id="vibe-create-heading" className="vibe-create-title">
              Broadcast Microadventure
            </h1>
            <p className="vibe-create-subtitle">
              Drop an open spark onto the city radar for fellow wanderers to discover. Exact
              coordinates stay protected in a safe radius until you approve a request.
            </p>
          </div>

          {/* Integrated Alert Banner */}
          {alert && (
            <div className={`vibe-create-alert ${alert.type}`} role="alert">
              <div className="vibe-create-alert-icon">
                {alert.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              </div>
              <div className="vibe-create-alert-content">
                <div className="vibe-create-alert-title">{alert.title}</div>
                {alert.messages.length === 1 ? (
                  <p>{alert.messages[0]}</p>
                ) : (
                  <ul className="vibe-create-alert-list">
                    {alert.messages.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                className="vibe-create-alert-close"
                onClick={() => setAlert(null)}
                aria-label="Dismiss alert"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Form */}
          <form className="vibe-create-form" onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <div className="vibe-field-group">
              <label htmlFor="vibe-title" className="vibe-field-label">
                <span>Vibe Title *</span>
                <span className="vibe-field-optional">Min. 3 characters</span>
              </label>
              <div className="vibe-input-wrapper">
                <Sparkles size={18} className="vibe-input-icon" aria-hidden="true" />
                <input
                  id="vibe-title"
                  type="text"
                  className="vibe-input"
                  placeholder="e.g., Sunset Rooftop Vinyl Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="vibe-field-group">
              <label htmlFor="vibe-description" className="vibe-field-label">
                <span>What's the plan? *</span>
                <span className="vibe-field-optional">Min. 10 characters</span>
              </label>
              <textarea
                id="vibe-description"
                className="vibe-textarea"
                placeholder="What to bring, what to expect, and what makes this spontaneous gathering special..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Location Name */}
            <div className="vibe-field-group">
              <label htmlFor="vibe-location" className="vibe-field-label">
                <span>Neighborhood or Landmark Zone</span>
                <span className="vibe-field-optional">Publicly displayed area</span>
              </label>
              <div className="vibe-input-wrapper">
                <MapPin size={18} className="vibe-input-icon" aria-hidden="true" />
                <input
                  id="vibe-location"
                  type="text"
                  className="vibe-input"
                  placeholder="e.g., Echo Park Lake (North Lawn)"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Coordinates Section with GPS & City Presets */}
            <div className="vibe-field-group">
              <div className="vibe-geo-header">
                <label className="vibe-field-label">
                  <span>Coordinates (Latitude & Longitude) *</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation || isLoading}
                  className="vibe-geo-detect-btn"
                >
                  <Navigation size={13} />
                  <span>{isDetectingLocation ? "Detecting GPS..." : "Detect My Location"}</span>
                </button>
              </div>

              <div className="vibe-field-row">
                <div className="vibe-input-wrapper">
                  <Compass size={18} className="vibe-input-icon" aria-hidden="true" />
                  <input
                    type="number"
                    step="any"
                    className="vibe-input"
                    placeholder="Latitude (e.g., 34.0754)"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="vibe-input-wrapper">
                  <Compass size={18} className="vibe-input-icon" aria-hidden="true" />
                  <input
                    type="number"
                    step="any"
                    className="vibe-input"
                    placeholder="Longitude (e.g., -118.2608)"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* City Presets */}
              <div className="vibe-preset-chips">
                <span style={{ fontSize: "0.72rem", color: "#6B7280" }}>Presets:</span>
                {CITY_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    className="vibe-preset-chip"
                    onClick={() => handleSelectPreset(p)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates: Start & End */}
            <div className="vibe-field-row">
              <div className="vibe-field-group">
                <label htmlFor="vibe-start-date" className="vibe-field-label">
                  <span>Start Rendezvous *</span>
                </label>
                <div className="vibe-input-wrapper">
                  <Calendar size={18} className="vibe-input-icon" aria-hidden="true" />
                  <input
                    id="vibe-start-date"
                    type="datetime-local"
                    className="vibe-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="vibe-field-group">
                <label htmlFor="vibe-end-date" className="vibe-field-label">
                  <span>Approx. End</span>
                  <span className="vibe-field-optional">Optional</span>
                </label>
                <div className="vibe-input-wrapper">
                  <Calendar size={18} className="vibe-input-icon" aria-hidden="true" />
                  <input
                    id="vibe-end-date"
                    type="datetime-local"
                    className="vibe-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Images Upload (Optional, up to 5) */}
            <div className="vibe-field-group">
              <label className="vibe-field-label">
                <span>Atmosphere Photos</span>
                <span className="vibe-field-optional">Max 5 images</span>
              </label>

              <div
                className="vibe-upload-zone"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <Camera size={26} className="vibe-upload-icon" />
                <div className="vibe-upload-text">Click or drag images to upload</div>
                <div className="vibe-upload-subtext">JPEG, PNG, WebP up to 10MB each</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="vibe-hidden-input"
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
              </div>

              {previewUrls.length > 0 && (
                <div className="vibe-images-preview-grid">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="vibe-img-thumb-wrap">
                      <img src={url} alt={`Preview ${index + 1}`} className="vibe-img-thumb" />
                      <button
                        type="button"
                        className="vibe-img-thumb-remove"
                        onClick={() => handleRemoveImage(index)}
                        aria-label="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="vibe-submit-btn"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>Broadcasting Spark...</span>
                </>
              ) : (
                <>
                  <span>Broadcast Spark Live</span>
                  <Radio size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VibeCreate;
