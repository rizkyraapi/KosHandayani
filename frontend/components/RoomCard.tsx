import React from 'react';

interface Amenity {
  icon: string;
  label: string;
}

interface RoomCardProps {
  name: string;
  location: string;
  price: string;
  imageUrl: string;
  status?: 'Kosong' | 'Terisi';
  amenities?: Amenity[];
}

const defaultAmenities: Amenity[] = [
  { icon: 'wifi', label: 'WiFi' },
  { icon: 'ac_unit', label: 'AC' },
  { icon: 'bathroom', label: 'KM Dalam' },
];

export default function RoomCard({
  name,
  location,
  price,
  imageUrl,
  status = 'Kosong',
  amenities = defaultAmenities,
}: RoomCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [buttonHoverStates, setButtonHoverStates] = React.useState({
    favoriteButton: false,
  });

  return (
    <div
      className="room-card"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: isHovered ? '0 20px 25px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="room-card-image" style={{ position: 'relative', height: '256px', overflow: 'hidden' }}>
        <img
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.5s',
          }}
          src={imageUrl}
          alt={name}
        />
        <div className="room-status-wrap" style={{ position: 'absolute', top: '16px', left: '16px' }}>
          <span
            className="room-status"
            style={{
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '4px',
              paddingBottom: '4px',
              backgroundColor: '#22c55e',
              color: '#004b1e',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#004b1e',
                borderRadius: '50%',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            ></span>
            {status}
          </span>
        </div>
        <div className="room-favorite-wrap" style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <button
            className="room-favorite"
            style={{
              padding: '8px',
              backgroundColor: buttonHoverStates.favoriteButton ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '50%',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={() => setButtonHoverStates({ ...buttonHoverStates, favoriteButton: true })}
            onMouseLeave={() => setButtonHoverStates({ ...buttonHoverStates, favoriteButton: false })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              favorite
            </span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .room-card {
          min-width: 0;
        }
        .room-card * {
          min-width: 0;
        }
        @media (max-width: 640px) {
          .room-card {
            border-radius: 8px !important;
          }
          .room-card-image {
            height: 64px !important;
          }
          .room-status-wrap {
            top: 4px !important;
            left: 4px !important;
          }
          .room-status {
            padding: 2px 5px !important;
            font-size: 0.5rem !important;
            gap: 2px !important;
          }
          .room-status span {
            width: 4px !important;
            height: 4px !important;
          }
          .room-favorite-wrap {
            display: none !important;
          }
          .room-body {
            padding: 6px !important;
          }
          .room-main-info {
            display: block !important;
            margin-bottom: 0 !important;
          }
          .room-title {
            font-size: 0.68rem !important;
            line-height: 1.15 !important;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .room-location {
            display: none !important;
          }
          .room-price-wrap {
            text-align: left !important;
            margin-top: 4px !important;
          }
          .room-price {
            font-size: 0.62rem !important;
            line-height: 1.15 !important;
            overflow-wrap: anywhere;
          }
          .room-period {
            display: none !important;
          }
          .room-amenities {
            display: none !important;
          }
          .room-actions {
            grid-template-columns: 1fr !important;
            gap: 4px !important;
            margin-top: 6px !important;
          }
          .room-actions button {
            padding: 5px 4px !important;
            border-radius: 6px !important;
            font-size: 0.56rem !important;
            line-height: 1.1 !important;
          }
          .room-actions button:first-child {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="room-body"
        style={{
          padding: '24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="room-main-info"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px',
          }}
        >
          <div>
            <h3
              className="room-title"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                fontFamily: 'Manrope, sans-serif',
                color: isHovered ? '#006e2f' : '#111c2d',
                transition: 'color 0.2s',
                margin: 0,
              }}
            >
              {name}
            </h3>
            <p
              className="room-location"
              style={{
                fontSize: '0.875rem',
                color: '#3d4a3d',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                margin: '4px 0 0 0',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                location_on
              </span>
              {location}
            </p>
          </div>
          <div className="room-price-wrap" style={{ textAlign: 'right' }}>
            <p
              className="room-price"
              style={{
                color: '#006e2f',
                fontWeight: 700,
                fontSize: '1.125rem',
                margin: '0 0 4px 0',
              }}
            >
              {price}
            </p>
            <p
              className="room-period"
              style={{
                fontSize: '0.625rem',
                color: '#3d4a3d',
                fontWeight: 700,
                margin: 0,
              }}
            >
              PER BULAN
            </p>
          </div>
        </div>

        <div
          className="room-amenities"
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '24px',
            marginBottom: '24px',
            paddingTop: '16px',
            paddingBottom: '16px',
            borderTop: '1px solid #f0f3ff',
            borderBottom: '1px solid #f0f3ff',
          }}
        >
          {amenities.map((amenity) => (
            <div
              key={amenity.icon}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#3d4a3d',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {amenity.icon}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{amenity.label}</span>
            </div>
          ))}
        </div>

        <div className="room-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 'auto' }}>
          <button
            style={{
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '10px',
              paddingBottom: '10px',
              borderRadius: '0.75rem',
              border: '1px solid #006e2f',
              color: '#006e2f',
              fontWeight: 700,
              fontSize: '0.875rem',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 110, 47, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Lihat Detail
          </button>
          <button
            style={{
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '10px',
              paddingBottom: '10px',
              borderRadius: '0.75rem',
              backgroundColor: '#006e2f',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              border: 'none',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#004b1e';
              e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#006e2f';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            Ajukan Sewa
          </button>
        </div>
      </div>
    </div>
  );
}
