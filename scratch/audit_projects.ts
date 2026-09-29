import { SYNTHETIC_CITIZEN_REPORTS } from '../src/data/syntheticCitizenReports';
import { clusterCitizenSubmissions, deriveDemandHotspots } from '../src/services/clusteringService';
import { calculateDevelopmentGaps } from '../src/services/developmentGapService';
import { calculatePriorityAssessments } from '../src/services/priorityService';
import { generateCandidateProjects } from '../src/services/projectService';

const clusters = clusterCitizenSubmissions(SYNTHETIC_CITIZEN_REPORTS);
const hotspots = deriveDemandHotspots(clusters);
const gaps = calculateDevelopmentGaps(hotspots);
const priorities = calculatePriorityAssessments(gaps, hotspots);
const projects = generateCandidateProjects(priorities);

console.log('Total Priorities:', priorities.length);
console.log('Total Projects:', projects.length);

projects.forEach((p, idx) => {
  const matchingPriority = priorities.find((pri) => pri.id === p.priorityAssessmentId);
  const matchingGap = gaps.find((g) => g.id === p.developmentGapId);
  console.log(`[${idx + 1}] ID: ${p.id} | District: ${p.districtName} (${p.stateName}) | Domain: ${p.civicDomain}`);
  console.log(`    Type: ${p.projectType}`);
  console.log(`    Title: ${p.projectTitle}`);
  console.log(`    Priority Ref ID Valid: ${Boolean(matchingPriority)} (Score: ${p.supportingEvidence.priorityScore})`);
  console.log(`    Gap Ref ID Valid: ${Boolean(matchingGap)} (Score: ${p.supportingEvidence.developmentGapScore})`);
  console.log(`    Voices: ${p.supportingEvidence.reportCount} | Infra Need: ${p.supportingEvidence.infrastructureNeed} | Demo: ${p.supportingEvidence.demographicPressure} | Invest Gap: ${p.supportingEvidence.investmentGap}`);
  console.log(`    Considerations: ${p.implementationConsiderations.length}`);
});
