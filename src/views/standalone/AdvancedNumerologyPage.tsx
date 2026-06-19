/**
 * Advanced Numerology page at /numerology/aw
 * Extended address numerology with property-type-first intake.
 * Property type controls which address fields are collected first (L1/L2 behavior).
 */

import { useState } from 'react';
import { StandalonePageWrapper } from './StandalonePageWrapper';
import { calculateAddressNumerology } from '../../calculators';
import { AddressNumerologyResults } from '../../components/results';
import type { AddressNumerologyResult } from '../../models/calculators';

const inputClass =
  'w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-[#2d2a3e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9a7d4e]/40 focus:border-[#9a7d4e] transition-colors';
const labelClass = 'block text-sm font-semibold text-[#4a4560] mb-2';

type PropertyType = 'singleFamily' | 'apartmentCondo' | 'commercial' | 'ruralNoNumber';

interface AdvancedFormData {
  propertyType: PropertyType;
  unitNumber: string;
  streetNumber: string;
  streetName: string;
  postalCode: string;
  homeYear: string;
  birthYear: string;
}

export function AdvancedNumerologyPage() {
  const [formData, setFormData] = useState<AdvancedFormData>({
    propertyType: 'singleFamily',
    unitNumber: '',
    streetNumber: '',
    streetName: '',
    postalCode: '',
    homeYear: '',
    birthYear: '',
  });
  const [addressResult, setAddressResult] = useState<AddressNumerologyResult | null>(null);
  const [error, setError] = useState('');

  const handleChange = (field: keyof AdvancedFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculateAddress = () => {
    setError('');
    try {
      // Property type drives what appears as L1/L2 by controlling which core address parts are present.
      const normalizedInput =
        formData.propertyType === 'ruralNoNumber'
          ? {
              unitNumber: '',
              streetNumber: '',
              streetName: formData.streetName,
              postalCode: formData.postalCode,
              homeYear: formData.homeYear,
              birthYear: formData.birthYear,
            }
          : {
              unitNumber: formData.propertyType === 'apartmentCondo' ? formData.unitNumber : '',
              streetNumber: formData.streetNumber,
              streetName: formData.streetName,
              postalCode: formData.postalCode,
              homeYear: formData.homeYear,
              birthYear: formData.birthYear,
            };

      const res = calculateAddressNumerology({
        unitNumber: normalizedInput.unitNumber,
        streetNumber: normalizedInput.streetNumber,
        streetName: normalizedInput.streetName,
        postalCode: normalizedInput.postalCode,
        homeYear: normalizedInput.homeYear,
        birthYear: normalizedInput.birthYear,
      });
      setAddressResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation failed');
      setAddressResult(null);
    }
  };

  const hasAddressInput =
    (formData.propertyType === 'apartmentCondo' && formData.unitNumber) ||
    formData.streetNumber ||
    formData.streetName ||
    formData.postalCode ||
    formData.birthYear;

  const propertyHints: Record<PropertyType, string> = {
    singleFamily:
      'For single-family homes, L1 starts with the street/building number and L2 is the street name.',
    apartmentCondo:
      'For apartments/condos, L1 is unit number, L2 is street/building number, and L3 is street name.',
    commercial:
      'For commercial spaces, use suite/unit if available, then building number and street name.',
    ruralNoNumber:
      'For properties without a clear street number, L1 starts with the street/property name.',
  };

  return (
    <StandalonePageWrapper
      title="Advanced Numerology"
      subtitle="Full address numerology analysis with themes, challenges, gifts, and reflection prompts"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-bold text-[#2d2a3e] mb-1">Address Numerology</h2>
          <p className="text-sm text-[#6b6188] mb-4">
            Addresses vary between countries & cities, so some fields may be empty — that&apos;s ok!
          </p>

          <div className="mb-4">
            <label className={labelClass}>Property Type</label>
            <select
              value={formData.propertyType}
              onChange={(e) => handleChange('propertyType', e.target.value as PropertyType)}
              className={inputClass}
            >
              <option value="singleFamily">Single Family Home / Standalone House</option>
              <option value="apartmentCondo">Apartment / Condo / Unit in Building</option>
              <option value="commercial">Commercial / Office / Retail</option>
              <option value="ruralNoNumber">Rural / No Clear Street Number</option>
            </select>
            <p className="text-xs text-[#6b6188] mt-2">{propertyHints[formData.propertyType]}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.propertyType === 'apartmentCondo' && (
              <div>
                <label className={labelClass}>Unit / Suite Number (L1)</label>
                <input
                  type="text"
                  value={formData.unitNumber}
                  onChange={(e) => handleChange('unitNumber', e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {formData.propertyType !== 'ruralNoNumber' && (
              <div>
                <label className={labelClass}>
                  {formData.propertyType === 'singleFamily'
                    ? 'Street / Building Number (L1)'
                    : 'Street / Building Number'}
                </label>
                <input
                  type="text"
                  value={formData.streetNumber}
                  onChange={(e) => handleChange('streetNumber', e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className={labelClass}>
                {formData.propertyType === 'ruralNoNumber' ? 'Street / Property Name (L1)' : 'Street Name'}
              </label>
              <input
                type="text"
                value={formData.streetName}
                onChange={(e) => handleChange('streetName', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Postal Code</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                placeholder="e.g. 2000"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Home Built Year</label>
              <input
                type="text"
                value={formData.homeYear}
                onChange={(e) => handleChange('homeYear', e.target.value)}
                placeholder="e.g. 1999"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Your Birth Year</label>
              <input
                type="text"
                value={formData.birthYear}
                onChange={(e) => handleChange('birthYear', e.target.value)}
                placeholder="e.g. 1996"
                className={inputClass}
              />
            </div>
          </div>

          <button
            onClick={handleCalculateAddress}
            disabled={!hasAddressInput}
            className="w-full mt-4 py-3 bg-[#9a7d4e] hover:bg-[#b8944a] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Calculate Address Numerology
          </button>

          {addressResult && (
            <div className="mt-6">
              <AddressNumerologyResults result={addressResult} />
            </div>
          )}
        </section>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </StandalonePageWrapper>
  );
}
