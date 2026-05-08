console.log('--- START 2025 WINNERS SEED SCRIPT ---');
import postgres from 'postgres';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

const fileLinks = [
  'agriculture_irankunda_faustin_CEOValleyViewAgriInitiative.webp',
  'bankingghana_emmanuel_ofori_boateng_ChiefInformationOfficerADBPlcGhana.webp',
  'education_aderonke_adeyegbe_GeneralManagingDirectorComercioLimited.webp',
  'educationegypt_mohamed_said_besheer_DeputyITDirectorEgyptianBankingInstitute.webp',
  'financial_services_institution_olufemi_yoloye_ChiefExecutiveOfficerCoronationGroupLimited.webp',
  'fintech_patrick_okebu_ChiefInformationOfficerInterswitchLimited.webp',
  'fmcg_adesegun_orafidiya_ChiefInformationOfficerBAT.webp',
  'health_dr_kieva_chris-amusan_Founder&CEOFertitude.webp',
  'technologyservices_dominic_ogar_CIOSignalAllianceTechnologyHolding.webp',
  'technologyservicesegypt_yehia_zakaria_CTOHamzaGroup.webp',
  'telecommunications_shoyinka_shodunke_ChiefInformationOfficerMTNNigeriaCommunicationsPlc.webp',
  'universalaviation_iuri_neto)COOTAAGAngolanAirlines.webp',
  'universalbanking_jose_cardoso_TechnologyManagerSiteReliabilityEngineerStandardBankAngola.webp',
  'universaleducation_meriem_somai_ChiefTechnologyOfficerUniversitéCentraleGroupTunisia.webp',
  'universalenergy_mohamed_alhaji_munu_ChiefExecutiveOfficerSierraPowerRenewableEnergySLLimited.webp',
  'universalfintech_mahmoud_diab_CTOJaudiTransfapay.webp',
  'universalfmcg_zahed_siddiqui_CIOMelcomGroup.webp',
  'universalhealth_edwin_wilson_mwanza_FounderInventiveSocietyOfScientists.webp',
  'universalmedia_omar_badr_ChiefInformationOfficerAlMasryAlYoum.webp',
  'universalotherfinancialinstitutions_olatunji_yusuf_saliu_CIOSUNUAssurancesGhanaLtd.webp',
  'universalpublic&socialservices&agencies_dr_olufemi_o_oyenuga_GroupExecutiveDirectorChamsCorp.webp',
  'universaltechnologyservices_victoria_sackey_ChiefOperationsOfficerMedTrack.webp',
  'universaltelecommunications_kwame_anokye_CTOAfriwaveTelecomGhanaLimited.webp'
];

/**
 * Utility to title case strings
 */
function titleCase(str: string) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Utility to split camelCase with spaces
 */
function splitCamelCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function parseFilename(filename: string) {
  const base = path.basename(filename, '.webp');

  // Rule: First word before first underscore is category
  const firstUnderscore = base.indexOf('_');
  const categoryRaw = firstUnderscore !== -1 ? base.substring(0, firstUnderscore) : base;

  // Rule: Last word after last underscore is organization
  // Special handling for the one with ')'
  const lastUnderscore = base.lastIndexOf('_');
  const lastSeparator = base.lastIndexOf(')');

  let orgRaw = '';
  let nameRaw = '';

  if (lastSeparator > lastUnderscore) {
    orgRaw = base.substring(lastSeparator + 1);
    nameRaw = base.substring(firstUnderscore + 1, lastSeparator);
  } else {
    orgRaw = base.substring(lastUnderscore + 1);
    nameRaw = base.substring(firstUnderscore + 1, lastUnderscore);
  }

  return {
    category: titleCase(categoryRaw),
    name: titleCase(nameRaw),
    organization: splitCamelCase(orgRaw)
  };
}

async function seed() {
  console.log(`🌱 Seeding ${fileLinks.length} award winners for 2025...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < fileLinks.length; i++) {
    const filename = fileLinks[i];
    const { category, name, organization } = parseFilename(filename);

    try {
      await sql`
        INSERT INTO award_winner (id, name, award_type, organization, year, display_order, created_at, updated_at)
        VALUES (
          ${randomUUID()},
          ${name},
          ${category},
          ${organization},
          ${'2025'},
          ${i + 1},
          NOW(),
          NOW()
        )
      `;
      console.log(`✅ [${i + 1}/${fileLinks.length}] ${name} (${organization}) — ${category}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed: ${filename}`, err);
      failCount++;
    }
  }

  console.log(`\n🏁 Seeding complete! ✅ ${successCount} succeeded, ❌ ${failCount} failed.`);
  process.exit(0);
}

seed();
