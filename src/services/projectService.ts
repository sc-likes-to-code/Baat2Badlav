/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PriorityAssessment } from '../types/priority';
import { CandidateProject, ProjectType } from '../types/project';

interface ArchetypeMapping {
  projectType: ProjectType;
  titleSuffix: string;
  description: string;
  targetNeed: string;
  considerations: string[];
}

/**
 * Deterministically maps domain + demand characteristics to an intervention archetype.
 */
function resolveProjectArchetype(
  domain: string,
  demandTitle: string,
  districtName: string
): ArchetypeMapping {
  const lowerTitle = demandTitle.toLowerCase();

  // 1. ROADS & MOBILITY
  if (domain === 'Roads & Mobility') {
    if (lowerTitle.includes('culvert') || lowerTitle.includes('bridge')) {
      return {
        projectType: 'Bridge & Culvert Rehabilitation',
        titleSuffix: `Bridge & Culvert Rehabilitation — ${districtName}`,
        description: `This candidate intervention focuses on structural rehabilitation and replacement of damaged wooden culverts and footbridges to restore safe village cross-drainage transit.`,
        targetNeed: `Restore safe cross-canal and cross-drainage connectivity by replacing deteriorated wooden structures.`,
        considerations: [
          'Structural safety inspection of existing wooden footbridges and culverts',
          'Canal flow volume and high-water level hydrological assessment',
          'Pedestrian and rural light vehicular crossing load validation',
          'Alternative temporary passage planning during rehabilitation',
        ],
      };
    }
    return {
      projectType: 'Drainage Improvement',
      titleSuffix: `Monsoon Drainage & Road Rehabilitation — ${districtName}`,
      description: `This candidate intervention addresses recurring rural transit disruptions by combining localized culvert and drainage clearing with targeted road surface rehabilitation along flood-prone corridors.`,
      targetNeed: `Reduce recurring transit disruption and road inundation associated with reported monsoon waterlogging.`,
      considerations: [
        'Seasonal water-flow and roadside drainage gradient mapping',
        'Pavement distress and surface condition assessment',
        'Culvert discharge capacity and unblocking evaluation',
        'All-weather rural transit continuity validation',
      ],
    };
  }

  // 2. WATER ACCESS
  if (domain === 'Water Access') {
    if (lowerTitle.includes('fluoride') || lowerTitle.includes('contamination') || lowerTitle.includes('iron') || lowerTitle.includes('quality')) {
      return {
        projectType: 'Water Quality Intervention',
        titleSuffix: `Water Quality & Filtration Intervention — ${districtName}`,
        description: `This candidate intervention explores localized filtration units, community water purification stations, and contamination monitoring for iron and fluoride affected handpumps.`,
        targetNeed: `Mitigate elevated fluoride and iron contamination in community handpump drinking water sources.`,
        considerations: [
          'Water sample laboratory chemical testing (fluoride and iron levels)',
          'Community filtration technology and media selection review',
          'Filter maintenance and sludge disposal protocol formulation',
          'Safe potable drinking water distribution access validation',
        ],
      };
    }
    return {
      projectType: 'Water Access Improvement',
      titleSuffix: `Community Water Access & Source Improvement — ${districtName}`,
      description: `This candidate intervention explores resilient community water supply pathways, source deepening, and alternative distribution points in habitations affected by seasonal groundwater depletion.`,
      targetNeed: `Improve access to reliable community water sources in areas exhibiting groundwater depletion demand signals.`,
      considerations: [
        'Hydrogeological source availability and aquifer assessment',
        'Piped and decentralized water point distribution analysis',
        'Seasonal water reliability mapping across dry months',
        'Community habitations access and standpost location validation',
      ],
    };
  }

  // 3. HEALTHCARE ACCESS
  if (domain === 'Healthcare Access') {
    return {
      projectType: 'Primary Healthcare Access',
      titleSuffix: `Primary Healthcare Access & Staffing Support — ${districtName}`,
      description: `This candidate intervention targets healthcare service accessibility constraints in rural habitations by exploring localized PHC clinical coverage, visiting medical support, and connectivity enhancements.`,
      targetNeed: `Address reported barriers to primary healthcare access and clinical service availability.`,
      considerations: [
        'Facility access and travel distance validation across outlying habitations',
        'Medical staff availability and service roster review',
        'Emergency transit and referral connectivity assessment',
        'Community health demand validation with local residents',
      ],
    };
  }

  // 4. ELECTRICITY & POWER
  if (domain === 'Electricity & Power') {
    if (lowerTitle.includes('voltage') || lowerTitle.includes('agricultural') || lowerTitle.includes('motor')) {
      return {
        projectType: 'Electricity Reliability Improvement',
        titleSuffix: `Agricultural Voltage & Distribution Improvement — ${districtName}`,
        description: `This candidate intervention examines low-voltage conditions in agricultural clusters by evaluating distribution transformer sizing, capacitor installations, and tail-end line reinforcement.`,
        targetNeed: `Mitigate tail-end low voltage conditions impacting agricultural tube-wells and irrigation motors.`,
        considerations: [
          'Voltage profile mapping across seasonal irrigation peak hours',
          'Distribution transformer distance and conductor gauge assessment',
          'Capacitor bank placement and reactive power compensation review',
          'Farmer irrigation schedule and power demand validation',
        ],
      };
    }
    return {
      projectType: 'Electricity Reliability Improvement',
      titleSuffix: `Electricity Feeder Reliability Improvement — ${districtName}`,
      description: `This candidate intervention addresses recurring power disruptions by evaluating rural feeder protection, transformer load balancing, and line maintenance across impacted habitations.`,
      targetNeed: `Reduce recurring feeder tripping and extended power outages in rural agricultural belts.`,
      considerations: [
        '11kV rural feeder fault logging and protection inspection',
        'Distribution transformer load pattern and capacity analysis',
        'Vegetation clearance and conductor maintenance review',
        'Domestic and irrigation power supply continuity verification',
      ],
    };
  }

  // 5. SCHOOL FACILITIES
  if (domain === 'School Facilities') {
    if (lowerTitle.includes('sanitation') || lowerTitle.includes('toilet') || lowerTitle.includes('girl')) {
      return {
        projectType: 'School Sanitation Improvement',
        titleSuffix: `School Sanitation & Hygiene Facility Improvement — ${districtName}`,
        description: `This candidate intervention explores the provision and refurbishment of functional, dedicated, and secure toilet blocks with continuous water supply in public schools.`,
        targetNeed: `Provide functional, dedicated, and hygienic sanitation facilities for students, particularly girls.`,
        considerations: [
          'School-level sanitation fixture and privacy audit',
          'Dedicated water supply and overhead storage assessment',
          'Waste disposal, septic tank, and drainage connection inspection',
          'Student-to-toilet ratio and gender-segregated accessibility validation',
        ],
      };
    }
    return {
      projectType: 'School Infrastructure Rehabilitation',
      titleSuffix: `School Classroom Infrastructure Rehabilitation — ${districtName}`,
      description: `This candidate intervention addresses primary school building deterioration through structural waterproofing, classroom repair, and safety enhancements.`,
      targetNeed: `Repair leaking roofs, cracked plaster, and structural deficiencies across primary school classrooms.`,
      considerations: [
        'Roof waterproofing and structural integrity assessment',
        'Plaster, flooring, and electrical wiring safety check',
        'Classroom seating capacity and lighting/ventilation review',
        'Safety boundary and learning environment verification',
      ],
    };
  }

  // Fallback
  return {
    projectType: 'Other Development Intervention',
    titleSuffix: `Civic Infrastructure Improvement — ${districtName}`,
    description: `This candidate intervention evaluates targeted developmental remediation to address localized citizen demand signals.`,
    targetNeed: `Address identified citizen demand signals and developmental deficits.`,
    considerations: [
      'Comprehensive baseline condition assessment',
      'Community stakeholder feedback collection',
      'Inter-departmental alignment review',
      'Locality implementation feasibility validation',
    ],
  };
}

/**
 * Generates neutral, explainable project rationale.
 */
function generateProjectRationale(
  priority: PriorityAssessment,
  archetype: ArchetypeMapping
): string {
  const score = priority.priorityScore;
  const gap = Math.round(priority.factors.developmentGap * 100);
  const band = priority.priorityBand;
  const urgencyDesc =
    priority.factors.urgency >= 0.85
      ? 'acute time-sensitive urgency'
      : priority.factors.urgency >= 0.6
      ? 'seasonal risk factors'
      : 'routine maintenance requirements';

  return `A ${band} rating (${score}/100) combining elevated localized demand (${priority.evidence.reportCount} reports), substantial development gap (${gap}/100), and ${urgencyDesc} supports evaluating ${archetype.projectType.toLowerCase()} as a candidate intervention pathway.`;
}

/**
 * Deterministically generates exactly one CandidateProject for each PriorityAssessment.
 */
export function generateCandidateProjects(
  priorityAssessments: PriorityAssessment[]
): CandidateProject[] {
  if (!priorityAssessments || priorityAssessments.length === 0) {
    return [];
  }

  const projects: CandidateProject[] = [];

  for (const priority of priorityAssessments) {
    const archetype = resolveProjectArchetype(
      priority.civicDomain,
      priority.demandTitle,
      priority.districtName
    );

    const rationale = generateProjectRationale(priority, archetype);
    const projectId = `proj-${priority.id.replace('priority-gap-', '').replace('priority-', '')}`;

    projects.push({
      id: projectId,
      priorityAssessmentId: priority.id,
      developmentGapId: priority.developmentGapId,
      districtId: priority.districtId,
      districtName: priority.districtName,
      stateId: priority.stateId,
      stateName: priority.stateName,
      civicDomain: priority.civicDomain,
      demandTitle: priority.demandTitle,
      projectType: archetype.projectType,
      projectTitle: archetype.titleSuffix,
      description: archetype.description,
      targetNeed: archetype.targetNeed,
      supportingEvidence: {
        reportCount: priority.evidence.reportCount,
        priorityScore: priority.priorityScore,
        developmentGapScore: Math.round(priority.factors.developmentGap * 100),
        severitySignal: priority.evidence.severitySignal,
        urgencySignal: priority.evidence.urgencySignal,
        infrastructureNeed: priority.evidence.infrastructureNeed,
        demographicPressure: priority.evidence.demographicPressure,
        investmentGap: priority.evidence.investmentGap,
      },
      rationale,
      implementationConsiderations: archetype.considerations,
      dataQuality: 'Synthetic Demonstration Data',
    });
  }

  return projects;
}
