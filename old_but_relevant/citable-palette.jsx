import React, { useState } from 'react';

// Citable Color Palette System
const palette = {
  light: {
    name: 'Citable Light',
    description: 'Warm, scholarly light mode inspired by aged paper and academic comfort',
    
    // Foundation
    background: {
      primary: '#FAF8F5',      // Warm cream - main page background
      secondary: '#F2EFEA',    // Sidebar, panels - slightly deeper warmth
      canvas: '#FFFFFF',       // Elevated surfaces, cards, PDF container
      elevated: '#FEFDFB',     // Tooltips, dropdowns, popovers
    },
    
    // Text
    text: {
      primary: '#2C2825',      // Warm charcoal - high readability
      secondary: '#6B635B',    // Muted warm gray - supporting text
      tertiary: '#9A9189',     // Placeholder, disabled states
      inverse: '#FAF8F5',      // Text on dark backgrounds
    },
    
    // Borders & Dividers
    border: {
      subtle: '#E8E4DD',       // Subtle dividers
      default: '#D9D4CB',      // Standard borders
      strong: '#C4BDB2',       // Emphasized borders
    },
    
    // Module Accents - Harmonized at ~45% saturation, ~45% lightness
    modules: {
      bibliography: {
        primary: '#5B7C95',    // Muted steel blue - calm, reliable
        light: '#E8EEF3',      // Tinted background
        dark: '#3D5A70',       // Hover/active states
        name: 'Bibliography',
        mental: 'Consultation / Reading',
        emotion: 'Calm, trustworthy, scholarly',
      },
      manuscripts: {
        primary: '#4A8F7C',    // Muted teal - confident creation
        light: '#E5F2EE',      // Tinted background
        dark: '#326657',       // Hover/active states
        name: 'Manuscripts',
        mental: 'Creation / Writing',
        emotion: 'Focused, productive, confident',
      },
      discover: {
        primary: '#8B6B99',    // Muted violet - curious exploration
        light: '#F0EAF3',      // Tinted background
        dark: '#694F78',       // Hover/active states
        name: 'Discover',
        mental: 'Exploration / Connection',
        emotion: 'Curious, expansive, inspiring',
      },
    },
    
    // Semantic
    semantic: {
      success: '#5A8A5A',      // Warm forest green
      successLight: '#E8F2E8',
      warning: '#B8863B',      // Warm amber
      warningLight: '#FBF3E5',
      error: '#B85450',        // Warm brick red
      errorLight: '#FAEEEE',
      info: '#5B7C95',         // Same as bibliography blue
      infoLight: '#E8EEF3',
    },
    
    // PDF Integration
    pdf: {
      container: '#FFFFFF',    // White container for natural paper feel
      shadow: 'rgba(44, 40, 37, 0.08)',
      annotation: '#FFF8DC',   // Warm highlight color
    },
  },
  
  dark: {
    name: 'Citable Dark',
    description: 'True black OLED-optimized with warm undertones',
    
    // Foundation - TRUE BLACK base
    background: {
      primary: '#000000',      // TRUE BLACK - OLED optimized
      secondary: '#0D0D0C',    // Barely lifted - sidebar, panels (warm tint)
      canvas: '#171614',       // Cards, elevated surfaces (warm charcoal)
      elevated: '#1E1D1A',     // Tooltips, dropdowns (warm)
    },
    
    // Text - Warm whites for reduced eye strain
    text: {
      primary: '#E8E4DF',      // Warm off-white - not harsh
      secondary: '#9A958D',    // Muted warm gray
      tertiary: '#5C5850',     // Placeholder, disabled
      inverse: '#0D0D0C',      // Text on light backgrounds
    },
    
    // Borders & Dividers - Subtle against true black
    border: {
      subtle: '#1F1E1B',       // Barely visible dividers
      default: '#2D2B27',      // Standard borders
      strong: '#3D3A35',       // Emphasized borders
    },
    
    // Module Accents - Adjusted for dark mode visibility
    modules: {
      bibliography: {
        primary: '#7BA3C2',    // Brighter steel blue
        light: '#162028',      // Dark tinted background
        dark: '#9ABBD6',       // Hover states - even brighter
        name: 'Bibliography',
        mental: 'Consultation / Reading',
        emotion: 'Calm, trustworthy, scholarly',
      },
      manuscripts: {
        primary: '#6BB8A2',    // Brighter teal
        light: '#0F1F1A',      // Dark tinted background
        dark: '#8DD4BE',       // Hover states
        name: 'Manuscripts',
        mental: 'Creation / Writing',
        emotion: 'Focused, productive, confident',
      },
      discover: {
        primary: '#AD8FBD',    // Brighter violet
        light: '#1A1420',      // Dark tinted background
        dark: '#C9ADd8',       // Hover states
        name: 'Discover',
        mental: 'Exploration / Connection',
        emotion: 'Curious, expansive, inspiring',
      },
    },
    
    // Semantic - Adjusted for dark backgrounds
    semantic: {
      success: '#7DB87D',
      successLight: '#141F14',
      warning: '#D4A558',
      warningLight: '#1F1A10',
      error: '#D47B77',
      errorLight: '#201414',
      info: '#7BA3C2',
      infoLight: '#162028',
    },
    
    // PDF Integration
    pdf: {
      container: '#1A1917',    // Warm dark for "paper"
      shadow: 'rgba(0, 0, 0, 0.4)',
      annotation: '#3D3520',   // Warm highlight in dark mode
    },
  },
};

// Contrast ratio calculator
function getLuminance(hex) {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

function ContrastBadge({ ratio }) {
  const numRatio = parseFloat(ratio);
  const level = numRatio >= 7 ? 'AAA' : numRatio >= 4.5 ? 'AA' : numRatio >= 3 ? 'AA Large' : 'Fail';
  const color = numRatio >= 4.5 ? '#5A8A5A' : numRatio >= 3 ? '#B8863B' : '#B85450';
  
  return (
    <span style={{
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '4px',
      backgroundColor: color,
      color: '#fff',
      fontWeight: '600',
    }}>
      {ratio}:1 {level}
    </span>
  );
}

function ColorSwatch({ color, name, description, showCopy = true, size = 'normal', mode, contrastAgainst }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  const isLight = getLuminance(color) > 0.5;
  const textColor = isLight ? '#2C2825' : '#E8E4DF';
  
  const sizeStyles = {
    small: { width: '60px', height: '60px' },
    normal: { width: '100%', height: '80px' },
    large: { width: '100%', height: '120px' },
  };
  
  return (
    <div style={{ marginBottom: '8px' }}>
      <div
        onClick={showCopy ? handleCopy : undefined}
        style={{
          ...sizeStyles[size],
          backgroundColor: color,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '10px',
          cursor: showCopy ? 'pointer' : 'default',
          transition: 'transform 0.15s ease',
          border: color === '#000000' || color === '#FFFFFF' ? `1px solid ${mode === 'dark' ? '#2D2B27' : '#D9D4CB'}` : 'none',
        }}
      >
        <span style={{ 
          color: textColor, 
          fontSize: '11px', 
          fontFamily: 'monospace',
          fontWeight: '500',
        }}>
          {copied ? '✓ Copied!' : color.toUpperCase()}
        </span>
      </div>
      <div style={{ marginTop: '6px' }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: '600',
          color: mode === 'dark' ? '#E8E4DF' : '#2C2825',
        }}>
          {name}
        </div>
        {description && (
          <div style={{ 
            fontSize: '11px', 
            color: mode === 'dark' ? '#9A958D' : '#6B635B',
            marginTop: '2px',
          }}>
            {description}
          </div>
        )}
        {contrastAgainst && (
          <div style={{ marginTop: '4px' }}>
            <ContrastBadge ratio={getContrastRatio(color, contrastAgainst)} />
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleCard({ module, mode, p }) {
  const colors = mode === 'dark' ? p.dark : p.light;
  
  return (
    <div style={{
      backgroundColor: module.light,
      borderRadius: '12px',
      padding: '20px',
      border: `2px solid ${module.primary}`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          backgroundColor: module.primary,
        }} />
        <div>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: colors.text.primary,
          }}>
            {module.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.text.secondary,
          }}>
            {module.mental}
          </div>
        </div>
      </div>
      
      <div style={{
        fontSize: '13px',
        color: colors.text.secondary,
        marginBottom: '16px',
        fontStyle: 'italic',
      }}>
        "{module.emotion}"
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { color: module.light, label: 'Light' },
          { color: module.primary, label: 'Primary' },
          { color: module.dark, label: 'Dark' },
        ].map((swatch) => (
          <div key={swatch.label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: '40px',
              backgroundColor: swatch.color,
              borderRadius: '6px',
              marginBottom: '4px',
              border: `1px solid ${colors.border.default}`,
            }} />
            <div style={{ 
              fontSize: '10px', 
              color: colors.text.secondary,
              fontFamily: 'monospace',
            }}>
              {swatch.color}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '11px', color: colors.text.tertiary, marginBottom: '4px' }}>
          Contrast vs {mode === 'dark' ? 'dark bg' : 'light bg'}:
        </div>
        <ContrastBadge ratio={getContrastRatio(module.primary, colors.background.primary)} />
      </div>
    </div>
  );
}

function PDFMockup({ mode, p }) {
  const colors = mode === 'dark' ? p.dark : p.light;
  
  return (
    <div style={{
      backgroundColor: colors.background.secondary,
      borderRadius: '12px',
      padding: '20px',
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: '12px',
      }}>
        PDF Integration Preview
      </div>
      
      <div style={{
        backgroundColor: colors.background.primary,
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        gap: '12px',
      }}>
        {/* Sidebar simulation */}
        <div style={{
          width: '80px',
          backgroundColor: colors.background.secondary,
          borderRadius: '6px',
          padding: '8px',
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '60px',
              backgroundColor: colors.background.canvas,
              borderRadius: '4px',
              marginBottom: '6px',
              border: `1px solid ${colors.border.subtle}`,
            }} />
          ))}
        </div>
        
        {/* PDF viewer simulation */}
        <div style={{
          flex: 1,
          backgroundColor: colors.pdf.container,
          borderRadius: '6px',
          padding: '24px',
          boxShadow: `0 2px 12px ${colors.pdf.shadow}`,
          minHeight: '200px',
        }}>
          {/* Fake PDF content */}
          <div style={{
            height: '16px',
            width: '60%',
            backgroundColor: mode === 'dark' ? '#3A3632' : '#2C2825',
            borderRadius: '3px',
            marginBottom: '16px',
          }} />
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: '8px',
              width: i === 4 ? '40%' : '100%',
              backgroundColor: mode === 'dark' ? '#4A4640' : '#9A9189',
              borderRadius: '2px',
              marginBottom: '8px',
              opacity: 0.6,
            }} />
          ))}
          <div style={{
            backgroundColor: colors.pdf.annotation,
            padding: '8px 12px',
            borderRadius: '4px',
            marginTop: '16px',
            marginBottom: '16px',
          }}>
            <div style={{
              height: '8px',
              width: '80%',
              backgroundColor: mode === 'dark' ? '#5A5550' : '#6B635B',
              borderRadius: '2px',
              opacity: 0.7,
            }} />
          </div>
          {[1, 2].map(i => (
            <div key={i} style={{
              height: '8px',
              width: i === 2 ? '70%' : '100%',
              backgroundColor: mode === 'dark' ? '#4A4640' : '#9A9189',
              borderRadius: '2px',
              marginBottom: '8px',
              opacity: 0.6,
            }} />
          ))}
        </div>
      </div>
      
      <div style={{
        marginTop: '12px',
        fontSize: '12px',
        color: colors.text.secondary,
        lineHeight: 1.5,
      }}>
        {mode === 'dark' ? (
          <>
            <strong>Dark mode approach:</strong> PDF uses warm dark gray (#1A1917) instead of pure white. 
            This eliminates harsh contrast jumps from true black while maintaining readable content. 
            Annotations use warm amber tones.
          </>
        ) : (
          <>
            <strong>Light mode approach:</strong> PDF container is pure white, slightly brighter than 
            the cream background (#FAF8F5). This creates a natural "paper on desk" effect where the 
            document feels like it's sitting on a warm surface.
          </>
        )}
      </div>
    </div>
  );
}

function SemanticColors({ mode, p }) {
  const colors = mode === 'dark' ? p.dark : p.light;
  const semantic = colors.semantic;
  
  const items = [
    { name: 'Success', color: semantic.success, bg: semantic.successLight, use: 'Save confirmed, sync complete' },
    { name: 'Warning', color: semantic.warning, bg: semantic.warningLight, use: 'Unsaved changes, conflicts' },
    { name: 'Error', color: semantic.error, bg: semantic.errorLight, use: 'Validation errors, failures' },
    { name: 'Info', color: semantic.info, bg: semantic.infoLight, use: 'Tips, neutral notifications' },
  ];
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    }}>
      {items.map(item => (
        <div key={item.name} style={{
          backgroundColor: item.bg,
          borderRadius: '8px',
          padding: '14px',
          borderLeft: `4px solid ${item.color}`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px',
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              backgroundColor: item.color,
            }} />
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: colors.text.primary,
            }}>
              {item.name}
            </span>
            <span style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              color: colors.text.secondary,
            }}>
              {item.color}
            </span>
          </div>
          <div style={{
            fontSize: '11px',
            color: colors.text.secondary,
          }}>
            {item.use}
          </div>
        </div>
      ))}
    </div>
  );
}

function ColorGrid({ colors, mode, title, bgColor }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: '600',
        color: mode === 'dark' ? '#E8E4DF' : '#2C2825',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {title}
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px',
      }}>
        {Object.entries(colors).map(([name, color]) => (
          <ColorSwatch
            key={name}
            color={color}
            name={name.charAt(0).toUpperCase() + name.slice(1)}
            mode={mode}
            contrastAgainst={bgColor}
          />
        ))}
      </div>
    </div>
  );
}

export default function CitablePalette() {
  const [mode, setMode] = useState('light');
  const colors = mode === 'dark' ? palette.dark : palette.light;
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background.primary,
      color: colors.text.primary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: colors.background.secondary,
        borderBottom: `1px solid ${colors.border.default}`,
        padding: '20px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '4px',
            }}>
              Citable Color System
            </h1>
            <p style={{
              fontSize: '14px',
              color: colors.text.secondary,
            }}>
              {colors.description}
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            backgroundColor: colors.background.canvas,
            padding: '4px',
            borderRadius: '10px',
            border: `1px solid ${colors.border.default}`,
          }}>
            {['light', 'dark'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: mode === m ? colors.modules.manuscripts.primary : 'transparent',
                  color: mode === m ? '#FFFFFF' : colors.text.secondary,
                  transition: 'all 0.2s ease',
                }}
              >
                {m === 'light' ? '☀️ Light' : '🌙 Dark'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px',
      }}>
        {/* Module Colors Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '8px',
          }}>
            Module Accent Colors
          </h2>
          <p style={{
            fontSize: '14px',
            color: colors.text.secondary,
            marginBottom: '24px',
            maxWidth: '600px',
          }}>
            Three distinct colors representing different cognitive modes, harmonized through 
            similar saturation (~40%) and lightness values for visual cohesion.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            {Object.values(colors.modules).map(module => (
              <ModuleCard key={module.name} module={module} mode={mode} p={palette} />
            ))}
          </div>
        </section>
        
        {/* Foundation Colors */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '24px',
          }}>
            Foundation Colors
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
          }}>
            <ColorGrid 
              colors={colors.background} 
              mode={mode} 
              title="Backgrounds" 
              bgColor={null}
            />
            <ColorGrid 
              colors={colors.text} 
              mode={mode} 
              title="Text" 
              bgColor={colors.background.primary}
            />
            <ColorGrid 
              colors={colors.border} 
              mode={mode} 
              title="Borders" 
              bgColor={null}
            />
          </div>
        </section>
        
        {/* Semantic Colors */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '8px',
          }}>
            Semantic Colors
          </h2>
          <p style={{
            fontSize: '14px',
            color: colors.text.secondary,
            marginBottom: '24px',
          }}>
            Warm-tinted status colors that feel cohesive with the palette.
          </p>
          
          <SemanticColors mode={mode} p={palette} />
        </section>
        
        {/* PDF Integration */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '8px',
          }}>
            PDF Integration Strategy
          </h2>
          <p style={{
            fontSize: '14px',
            color: colors.text.secondary,
            marginBottom: '24px',
          }}>
            How documents "melt into" the interface instead of appearing as floating rectangles.
          </p>
          
          <PDFMockup mode={mode} p={palette} />
        </section>
        
        {/* Design Rationale */}
        <section style={{
          backgroundColor: colors.background.secondary,
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '16px',
          }}>
            Design Rationale
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: colors.modules.bibliography.primary,
                marginBottom: '8px',
              }}>
                Module Color Harmony
              </h3>
              <p style={{
                fontSize: '13px',
                color: colors.text.secondary,
                lineHeight: 1.6,
              }}>
                All three module colors share ~40% saturation and ~45-50% lightness (in light mode). 
                This creates distinct identities while maintaining visual cohesion. The hues are 
                spread evenly: blue (210°), teal (165°), violet (280°).
              </p>
            </div>
            
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: colors.modules.manuscripts.primary,
                marginBottom: '8px',
              }}>
                True Black + Warmth
              </h3>
              <p style={{
                fontSize: '13px',
                color: colors.text.secondary,
                lineHeight: 1.6,
              }}>
                The dark mode uses #000000 for OLED efficiency, but elevated surfaces and text 
                carry warm undertones (subtle brown/cream shifts). This prevents the clinical 
                feel while maintaining true black benefits.
              </p>
            </div>
            
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: colors.modules.discover.primary,
                marginBottom: '8px',
              }}>
                Eye Strain Reduction
              </h3>
              <p style={{
                fontSize: '13px',
                color: colors.text.secondary,
                lineHeight: 1.6,
              }}>
                Light mode uses cream (#FAF8F5) instead of white, reducing blue light. 
                Dark mode avoids harsh white text (#E8E4DF vs #FFFFFF). 
                All accents are muted, reducing visual vibration during long sessions.
              </p>
            </div>
            
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: '8px',
              }}>
                PDF Philosophy
              </h3>
              <p style={{
                fontSize: '13px',
                color: colors.text.secondary,
                lineHeight: 1.6,
              }}>
                Light: PDF white is brighter than app cream, creating "paper on desk" effect. 
                Dark: PDF uses warm gray (#1A1917), avoiding jarring white-on-black contrast. 
                Both approaches make documents feel integrated, not overlaid.
              </p>
            </div>
          </div>
        </section>
        
        {/* Quick Reference */}
        <section style={{ marginTop: '48px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '16px',
          }}>
            Quick Reference (Copy-Ready)
          </h2>
          
          <div style={{
            backgroundColor: colors.background.canvas,
            borderRadius: '8px',
            padding: '20px',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: 1.8,
            border: `1px solid ${colors.border.default}`,
            overflowX: 'auto',
          }}>
            <pre style={{ margin: 0 }}>
{`/* ${mode === 'dark' ? 'Dark' : 'Light'} Mode - Citable */

/* Backgrounds */
--bg-primary: ${colors.background.primary};
--bg-secondary: ${colors.background.secondary};
--bg-canvas: ${colors.background.canvas};
--bg-elevated: ${colors.background.elevated};

/* Text */
--text-primary: ${colors.text.primary};
--text-secondary: ${colors.text.secondary};
--text-tertiary: ${colors.text.tertiary};

/* Borders */
--border-subtle: ${colors.border.subtle};
--border-default: ${colors.border.default};
--border-strong: ${colors.border.strong};

/* Module: Bibliography */
--bibliography-primary: ${colors.modules.bibliography.primary};
--bibliography-light: ${colors.modules.bibliography.light};
--bibliography-dark: ${colors.modules.bibliography.dark};

/* Module: Manuscripts */
--manuscripts-primary: ${colors.modules.manuscripts.primary};
--manuscripts-light: ${colors.modules.manuscripts.light};
--manuscripts-dark: ${colors.modules.manuscripts.dark};

/* Module: Discover */
--discover-primary: ${colors.modules.discover.primary};
--discover-light: ${colors.modules.discover.light};
--discover-dark: ${colors.modules.discover.dark};

/* Semantic */
--success: ${colors.semantic.success};
--warning: ${colors.semantic.warning};
--error: ${colors.semantic.error};
--info: ${colors.semantic.info};

/* PDF */
--pdf-container: ${colors.pdf.container};`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
