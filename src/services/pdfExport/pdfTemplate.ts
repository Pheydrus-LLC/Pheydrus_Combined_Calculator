import type { ConsolidatedResults, AstrologyAspect } from '../../models';
import type { AngularDiagnosticResult, GradeItem, FinalGrade } from '../../models/diagnostic';

const GRADE_COLORS: Record<FinalGrade, { bg: string; border: string; text: string }> = {
  A: { bg: '#ecfdf5', border: '#34d399', text: '#065f46' },
  B: { bg: '#eff6ff', border: '#60a5fa', text: '#1e40af' },
  C: { bg: '#fffbeb', border: '#fbbf24', text: '#92400e' },
  F: { bg: '#fef2f2', border: '#f87171', text: '#991b1b' },
};

function getGradeItemBg(grade: GradeItem['grade']): string {
  if (grade === 'F') return 'background: #fef2f2; border-left: 4px solid #f87171;';
  if (grade === 'A') return 'background: #ecfdf5; border-left: 4px solid #34d399;';
  return 'background: #f9fafb; border-left: 4px solid #d1d5db;';
}

function getGradeBadgeStyle(grade: GradeItem['grade']): string {
  if (grade === 'F') return 'background: #fee2e2; color: #991b1b;';
  if (grade === 'A') return 'background: #d1fae5; color: #065f46;';
  return 'background: #f3f4f6; color: #6b7280;';
}

function renderDiagnosticSection(diagnostic: AngularDiagnosticResult): string {
  const gc = GRADE_COLORS[diagnostic.finalGrade];

  return `
  <div class="section" style="border: 2px solid ${gc.border}; border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <div style="background: ${gc.bg}; padding: 15px 20px; border-bottom: 2px solid ${gc.border};">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="margin: 0; border: none; padding: 0;">Angular Diagnostic</h2>
          <p style="margin: 4px 0 0; color: #666; font-size: 12px;">The Three Pillars Model — Identity, Timing, Environment</p>
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #666;">Total F's</div>
            <div style="font-size: 22px; font-weight: bold; color: #dc2626;">${diagnostic.totalFs}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #666;">Total A's</div>
            <div style="font-size: 22px; font-weight: bold; color: #059669;">${diagnostic.totalAs}</div>
          </div>
          <div style="width: 60px; height: 60px; border: 3px solid ${gc.border}; border-radius: 8px; background: ${gc.bg}; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-size: 28px; font-weight: 900; color: ${gc.text};">${diagnostic.finalGrade}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pillars -->
    <div style="padding: 15px 20px;">
      ${diagnostic.pillars
        .map(
          (pillar) => `
      <div style="margin-bottom: 15px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
        <div style="background: #f9fafb; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #1f2937;">Pillar ${pillar.pillar}: ${pillar.name}</strong>
            <span style="color: #6b7280; font-size: 12px; margin-left: 8px;">${escapeHtml(pillar.description)}</span>
          </div>
          <div>
            ${pillar.fCount > 0 ? `<span class="badge badge-malefic">${pillar.fCount} F${pillar.fCount !== 1 ? "'s" : ''}</span>` : ''}
            ${pillar.aCount > 0 ? `<span class="badge badge-benefic">${pillar.aCount} A${pillar.aCount !== 1 ? "'s" : ''}</span>` : ''}
          </div>
        </div>
        ${
          pillar.items.length > 0
            ? `<div style="padding: 10px 15px;">
          ${pillar.items
            .map(
              (item) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; margin: 4px 0; border-radius: 4px; ${getGradeItemBg(item.grade)}">
            <div>
              <strong style="font-size: 13px; color: #1f2937;">${escapeHtml(item.source)}</strong>
              <div style="font-size: 11px; color: #6b7280;">${escapeHtml(item.reason)}</div>
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; ${getGradeBadgeStyle(item.grade)}">${item.grade === 'Neutral' ? '—' : item.grade}</span>
          </div>
          `
            )
            .join('')}
        </div>`
            : '<p style="padding: 10px 15px; color: #9ca3af; font-style: italic; margin: 0;">No data available for this pillar</p>'
        }
      </div>
      `
        )
        .join('')}
    </div>

    <!-- Grade scale -->
    <div style="background: #f9fafb; padding: 8px 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
      <strong>Grade Scale:</strong> A = 0-2 F's &nbsp; B = 3-6 F's &nbsp; D = 7-9 F's &nbsp; F = 10+ F's &nbsp;&nbsp; <em>A's do not offset F's</em>
    </div>
  </div>
  `;
}

/**
 * Render an angle aspect section for the PDF
 */
function renderAngleAspectSection(title: string, aspects: AstrologyAspect[]): string {
  if (!aspects || aspects.length === 0) return '';
  return `
    <h3>${escapeHtml(title)}</h3>
    ${aspects.map((a) => `<p>${escapeHtml(a.planet_1.en)} ${escapeHtml(a.aspect.en)} ${escapeHtml(a.planet_2.en)}</p>`).join('')}
  `;
}

/**
 * Generate PDF template HTML from consolidated results
 */
export function generatePDFTemplate(results: ConsolidatedResults): string {
  const { userInfo, calculators, timestamp } = results;
  const reportDate = new Date(timestamp).toLocaleDateString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pheydrus Report - ${userInfo.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
      background: #fff;
    }
    h1 { font-size: 28px; margin-bottom: 10px; color: #1a1a1a; }
    h2 { font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #333; border-bottom: 2px solid #ddd; padding-bottom: 8px; }
    h3 { font-size: 14px; margin-top: 15px; margin-bottom: 10px; color: #555; }
    p { margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #ddd; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) { background: #fafafa; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
    .profile-item { padding: 10px; background: #f9f9f9; border-left: 3px solid #007bff; }
    .profile-label { font-size: 12px; color: #666; font-weight: 600; }
    .profile-value { font-size: 14px; color: #333; margin-top: 3px; }
    .card { padding: 15px; background: #f9f9f9; border-left: 4px solid #007bff; margin: 10px 0; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin: 2px 2px 2px 0; }
    .badge-benefic { background: #d4edda; color: #155724; }
    .badge-malefic { background: #f8d7da; color: #721c24; }
    .badge-neutral { background: #e7e7e7; color: #383838; }
    .retrograde { color: #d32f2f; font-weight: bold; }
    .page-break { page-break-after: always; }
    .timestamp { text-align: right; color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h1>Pheydrus Calculation Report</h1>
    <p style="color: #666; font-size: 14px;">Complete Astrological & Numerological Analysis</p>
  </div>

  <!-- User Profile -->
  <div class="section">
    <h2>Your Profile</h2>
    <div class="profile-grid">
      <div class="profile-item">
        <div class="profile-label">Name</div>
        <div class="profile-value">${escapeHtml(userInfo.name)}</div>
      </div>
      <div class="profile-item">
        <div class="profile-label">Date of Birth</div>
        <div class="profile-value">${escapeHtml(userInfo.dateOfBirth)}</div>
      </div>
      <div class="profile-item">
        <div class="profile-label">Time of Birth</div>
        <div class="profile-value">${escapeHtml(userInfo.timeOfBirth)}</div>
      </div>
      <div class="profile-item">
        <div class="profile-label">Birth Location</div>
        <div class="profile-value">${escapeHtml(userInfo.birthLocation)}</div>
      </div>
      <div class="profile-item">
        <div class="profile-label">Current Location</div>
        <div class="profile-value">${escapeHtml(userInfo.currentLocation)}</div>
      </div>
    </div>
  </div>

  <!-- Angular Diagnostic -->
  ${results.diagnostic ? renderDiagnosticSection(results.diagnostic) : ''}

  <!-- Transits -->
  ${
    calculators.transits
      ? `
  <div class="section">
    <h2>Planetary Transits</h2>
    <div class="card">
      <strong>Rising Sign:</strong> ${escapeHtml(calculators.transits.risingSign)}
    </div>
    ${
      calculators.transits.transits.length > 0
        ? calculators.transits.transits
            .map(
              (transit) => `
    <div class="card" style="margin: 15px 0;">
      <div style="margin-bottom: 8px;">
        <strong style="font-size: 16px;">${escapeHtml(transit.planet)}</strong>
        <span style="color: #666; font-style: italic; margin-left: 8px;">${escapeHtml(transit.planetTheme)}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <div style="font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px;">Current Transit</div>
          <p style="margin: 2px 0;"><strong>Sign:</strong> ${escapeHtml(transit.current.sign)}</p>
          <p style="margin: 2px 0;"><strong>Period:</strong> ${escapeHtml(transit.current.start)} — ${escapeHtml(transit.current.end)}</p>
          <p style="margin: 2px 0;"><strong>House ${transit.houseNumber}:</strong> ${escapeHtml(transit.houseTheme)}</p>
          <p style="margin: 2px 0; color: #166534;"><strong>Gifts:</strong> ${escapeHtml(transit.current.high)}</p>
          <p style="margin: 2px 0; color: #991b1b;"><strong>Challenges:</strong> ${escapeHtml(transit.current.low)}</p>
        </div>
        <div>
          <div style="font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px;">Past Transit</div>
          <p style="margin: 2px 0;"><strong>Sign:</strong> ${escapeHtml(transit.past.sign)}</p>
          <p style="margin: 2px 0;"><strong>Period:</strong> ${escapeHtml(transit.past.start)} — ${escapeHtml(transit.past.end)}</p>
          <p style="margin: 2px 0; color: #166534;"><strong>Gifts:</strong> ${escapeHtml(transit.past.high)}</p>
          <p style="margin: 2px 0; color: #991b1b;"><strong>Challenges:</strong> ${escapeHtml(transit.past.low)}</p>
        </div>
      </div>
    </div>
    `
            )
            .join('')
        : '<p>No transit data available</p>'
    }
  </div>
  `
      : ''
  }

  <!-- Natal Chart -->
  ${
    calculators.natalChart
      ? `
  <div class="section">
    <h2>Natal Chart</h2>
    <div class="card">
      <strong>Ascendant (Rising Sign):</strong> ${escapeHtml(calculators.natalChart.risingSign)}
    </div>

    <h3>Planets</h3>
    ${
      calculators.natalChart.planets.length > 0
        ? `
    <table>
      <thead>
        <tr>
          <th>Planet</th>
          <th>Sign</th>
          <th>House</th>
        </tr>
      </thead>
      <tbody>
        ${calculators.natalChart.planets
          .map(
            (planet) => `
        <tr>
          <td><strong>${escapeHtml(planet.planet.en)}</strong>${planet.isRetro === 'True' || planet.isRetro === 'true' ? ' <span class="retrograde">R</span>' : ''}</td>
          <td>${escapeHtml(planet.zodiac_sign.name.en)}</td>
          <td>${planet.house || ''}</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : '<p>No planet data available</p>'
    }

    ${
      calculators.natalChart.aspects && calculators.natalChart.aspects.length > 0
        ? `
    <h3>Aspects</h3>
    ${calculators.natalChart.aspects
      .map(
        (aspect) =>
          `<p>${escapeHtml(aspect.planet_1.en)} ${escapeHtml(aspect.aspect.en)} ${escapeHtml(aspect.planet_2.en)}</p>`
      )
      .join('')}
    `
        : ''
    }

    ${
      calculators.natalChart.angleAspects
        ? `
    ${renderAngleAspectSection('IC Aspects', calculators.natalChart.angleAspects.ic)}
    ${renderAngleAspectSection('DSC Aspects', calculators.natalChart.angleAspects.dsc)}
    ${renderAngleAspectSection('MC Aspects', calculators.natalChart.angleAspects.mc)}
    ${renderAngleAspectSection('ASC Aspects', calculators.natalChart.angleAspects.asc)}
    `
        : ''
    }
  </div>
  `
      : ''
  }

  <!-- Life Path -->
  ${
    calculators.lifePath
      ? `
  <div class="section">
    <h2>Life Path & Numerology</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin: 15px 0;">
      <div class="card" style="border-left-color: #6366f1;">
        <div class="profile-label">Life Path Number</div>
        <div style="font-size: 24px; font-weight: bold; color: #6366f1; margin-top: 5px;">${calculators.lifePath.lifePathNumber}</div>
      </div>
      <div class="card" style="border-left-color: #14b8a6;">
        <div class="profile-label">Day Path Number</div>
        <div style="font-size: 24px; font-weight: bold; color: #14b8a6; margin-top: 5px;">${calculators.lifePath.dayPathNumber}</div>
      </div>
      <div class="card" style="border-left-color: #f59e0b;">
        <div class="profile-label">Personal Year</div>
        <div style="font-size: 24px; font-weight: bold; color: #f59e0b; margin-top: 5px;">${calculators.lifePath.personalYear}</div>
      </div>
      <div class="card" style="border-left-color: #ec4899;">
        <div class="profile-label">Chinese Zodiac</div>
        <div style="font-size: 18px; font-weight: bold; color: #ec4899; margin-top: 5px;">${escapeHtml(calculators.lifePath.chineseZodiac)}</div>
      </div>
    </div>

    <h3>Life Path Meaning</h3>
    <p><strong>${escapeHtml(calculators.lifePath.meanings.lifePathMeaning)}</strong></p>
    <p>${escapeHtml(calculators.lifePath.meanings.lifePathDescription)}</p>

    <h3>Personal Year Meaning</h3>
    <p><strong>${escapeHtml(calculators.lifePath.meanings.personalYearMeaning)}</strong></p>
    <p>${escapeHtml(calculators.lifePath.meanings.personalYearDescription)}</p>
  </div>
  `
      : ''
  }

  <!-- Relocation -->
  ${
    calculators.relocation
      ? `
  <div class="section">
    <h2>Relocation Analysis</h2>
    ${
      calculators.relocation.angularHits && calculators.relocation.angularHits.length > 0
        ? `
    <h3>Angular Hits</h3>
    <p>Planets activating angles in the relocated chart</p>
    <table>
      <thead>
        <tr>
          <th>Planet</th>
          <th>Angle</th>
          <th>House</th>
          <th>Nature</th>
          <th>Career</th>
        </tr>
      </thead>
      <tbody>
        ${calculators.relocation.angularHits
          .map(
            (hit) => `
        <tr${hit.isCareer ? ' style="background: #fffbeb;"' : ''}>
          <td><strong>${escapeHtml(hit.key)}</strong></td>
          <td>${escapeHtml(hit.angle)}</td>
          <td>${hit.house}</td>
          <td><span class="badge badge-${hit.nature}">${hit.nature}</span></td>
          <td>${hit.isCareer ? '<span class="badge" style="background: #fef3c7; color: #92400e;">career</span>' : ''}</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }

    ${
      calculators.relocation.businessHouseActivations &&
      calculators.relocation.businessHouseActivations.length > 0
        ? `
    <h3>Business House Activations</h3>
    <p>Planets in houses 2 (Finances), 6 (Work), and 10 (Career)</p>
    <table>
      <thead>
        <tr>
          <th>Planet</th>
          <th>House</th>
          <th>Theme</th>
          <th>Nature</th>
        </tr>
      </thead>
      <tbody>
        ${calculators.relocation.businessHouseActivations
          .map((activation) => {
            const theme =
              activation.house === 2 ? 'Finances' : activation.house === 6 ? 'Work' : 'Career';
            return `
        <tr>
          <td><strong>${escapeHtml(activation.key)}</strong></td>
          <td>${activation.house}</td>
          <td>${theme}</td>
          <td><span class="badge badge-${activation.nature}">${activation.nature}</span></td>
        </tr>
        `;
          })
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }
  </div>
  `
      : ''
  }

  <!-- Address Numerology -->
  ${
    calculators.addressNumerology
      ? `
  <div class="section">
    <h2>Address Numerology</h2>

    <h3>Numerology Levels</h3>
    ${calculators.addressNumerology.levels
      .map(
        (level) => `
    <div class="card" style="margin: 10px 0;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <div>
          <span style="font-weight: 600; color: #555;">${escapeHtml(level.level)}</span>
          <span style="color: #888; font-size: 12px; margin-left: 4px;">${escapeHtml(level.name)}</span>
          <div style="color: #999; font-size: 12px;">${escapeHtml(level.value)}</div>
          <div style="font-size: 24px; font-weight: bold; margin-top: 4px;">${level.number}</div>
        </div>
        <div style="text-align: right; font-size: 16px; font-weight: 600;">${escapeHtml(level.meaning)}</div>
      </div>
      <p style="margin: 8px 0;">${escapeHtml(level.description)}</p>
      ${
        level.themes
          ? `
      <div style="border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px; font-size: 13px;">
        <p style="margin: 4px 0;"><strong>Themes:</strong> ${escapeHtml(level.themes)}</p>
        <p style="margin: 4px 0;"><strong>Challenges:</strong> ${escapeHtml(level.challenges)}</p>
        <p style="margin: 4px 0;"><strong>Gifts:</strong> ${escapeHtml(level.gifts)}</p>
        <p style="margin: 4px 0; font-style: italic; color: #666;">${escapeHtml(level.reflection)}</p>
      </div>
      `
          : ''
      }
    </div>
    `
      )
      .join('')}

    <h3>Chinese Zodiac Compatibility</h3>
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 15px 0;">
      <div class="card" style="border-left-color: #ea580c;">
        <div class="profile-label">Home Zodiac</div>
        <div style="font-size: 18px; font-weight: bold; color: #ea580c; margin-top: 5px;">${escapeHtml(calculators.addressNumerology.homeZodiac)}</div>
      </div>
      <div class="card" style="border-left-color: #0891b2;">
        <div class="profile-label">Birth Zodiac</div>
        <div style="font-size: 18px; font-weight: bold; color: #0891b2; margin-top: 5px;">${escapeHtml(calculators.addressNumerology.birthZodiac)}</div>
      </div>
      <div class="card" style="border-left-color: #e91e8c;">
        <div class="profile-label">Compatibility</div>
        <div style="font-size: 18px; font-weight: bold; color: #e91e8c; margin-top: 5px;">${escapeHtml(calculators.addressNumerology.compatibility)}</div>
      </div>
    </div>

    ${
      calculators.addressNumerology.homeZodiacMeaning
        ? `
    <div class="card" style="margin: 10px 0;">
      <div class="profile-label">Home Year Zodiac</div>
      <div style="font-size: 18px; font-weight: bold; margin: 4px 0;">${escapeHtml(calculators.addressNumerology.homeZodiacMeaning.name)}</div>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Themes:</strong> ${escapeHtml(calculators.addressNumerology.homeZodiacMeaning.themes)}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Challenges:</strong> ${escapeHtml(calculators.addressNumerology.homeZodiacMeaning.challenges)}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Gifts:</strong> ${escapeHtml(calculators.addressNumerology.homeZodiacMeaning.gifts)}</p>
      <p style="margin: 4px 0; font-size: 13px; font-style: italic; color: #666;">${escapeHtml(calculators.addressNumerology.homeZodiacMeaning.reflection)}</p>
    </div>
    `
        : ''
    }

    ${
      calculators.addressNumerology.birthZodiacMeaning
        ? `
    <div class="card" style="margin: 10px 0;">
      <div class="profile-label">Birth Year Zodiac</div>
      <div style="font-size: 18px; font-weight: bold; margin: 4px 0;">${escapeHtml(calculators.addressNumerology.birthZodiacMeaning.name)}</div>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Themes:</strong> ${escapeHtml(calculators.addressNumerology.birthZodiacMeaning.themes)}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Challenges:</strong> ${escapeHtml(calculators.addressNumerology.birthZodiacMeaning.challenges)}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Gifts:</strong> ${escapeHtml(calculators.addressNumerology.birthZodiacMeaning.gifts)}</p>
      <p style="margin: 4px 0; font-size: 13px; font-style: italic; color: #666;">${escapeHtml(calculators.addressNumerology.birthZodiacMeaning.reflection)}</p>
    </div>
    `
        : ''
    }

    <h3>Compatibility Guide</h3>
    <p><strong>perfect match:</strong> Excellent alignment between home and birth energies</p>
    <p><strong>good match:</strong> Generally positive alignment</p>
    <p><strong>above average:</strong> Supportive dynamics with minor adjustments</p>
    <p><strong>average:</strong> Neither particularly supportive nor challenging</p>
    <p><strong>good match OR enemy:</strong> Polarizing - can go either way</p>
    <p><strong>worst:</strong> Challenging dynamics that require conscious work</p>
  </div>
  `
      : ''
  }

  <!-- Footer -->
  <div class="timestamp">
    <p>Report generated: ${reportDate}</p>
    <p>Pheydrus Combined Calculator</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate PDF filename
 */
export function generateFilename(results: ConsolidatedResults): string {
  const date = new Date(results.timestamp).toISOString().split('T')[0];
  const name = results.userInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
  return `Pheydrus_Report_${name}_${date}.pdf`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
