import type {
  AiAnalysisResponse,
  AiThreatAnalysis,
  CollisionAlert,
  ManeuverRecommendation,
  RiskAssessment,
} from '@/services/types'

function confidenceFor(event: CollisionAlert, maneuver?: ManeuverRecommendation): number {
  const maneuverScore = maneuver?.action === 'MANEUVER' ? 8 : 0
  return Math.min(99, Math.round(event.detectionConfidence + maneuverScore))
}

function recommendationFor(event: CollisionAlert, maneuver?: ManeuverRecommendation): string {
  if (!maneuver || maneuver.action === 'MONITOR') {
    return `Monitor ${event.object1} and ${event.object2}; current screening does not require a burn.`
  }

  return `${maneuver.burnDirection} burn for ${maneuver.objectName}: ${maneuver.deltaV.toFixed(3)} m/s before ${new Date(maneuver.safeWindowClose).toISOString()}.`
}

export function buildAiAnalysis(
  events: CollisionAlert[],
  risks: RiskAssessment[],
  maneuvers: ManeuverRecommendation[],
): AiAnalysisResponse {
  const maneuverByConjunction = new Map(maneuvers.map((maneuver) => [maneuver.conjunctionId, maneuver]))
  const highPriorityEvents = events
    .filter((event) => event.riskClassification !== 'LOW')
    .slice(0, 6)

  const threats: AiThreatAnalysis[] = highPriorityEvents.map((event, index) => {
    const maneuver = maneuverByConjunction.get(event.id)
    const recommendation = recommendationFor(event, maneuver)

    return {
      alertId: event.id,
      rank: index + 1,
      phaseLogs: [
        {
          agent: 'DETECTION',
          text: `Conjunction screened: ${event.object1} vs ${event.object2}. Closest approach ${event.minDistance.toFixed(1)} km at TCA ${event.timeToClosestApproach.toFixed(1)} h.`,
        },
        {
          agent: 'ANALYSIS',
          text: `Risk ${event.riskClassification}; collision probability ${(event.probability * 100).toFixed(3)}%; relative velocity ${event.relativeVelocity.toFixed(2)} km/s.`,
        },
        {
          agent: 'DECISION',
          text: recommendation,
        },
      ],
      summary: `${event.riskClassification} conjunction ranked #${index + 1} by miss distance, probability, and object priority.`,
      confidence: confidenceFor(event, maneuver),
      recommendation,
    }
  })

  const elevatedRisks = risks
    .filter((risk) => risk.classification === 'HIGH' || risk.classification === 'CRITICAL')
    .slice(0, 5)
    .map((risk) => `${risk.objectName}: ${risk.classification} risk score ${risk.riskScore}`)

  return {
    generatedAt: new Date().toISOString(),
    overallSummary: threats.length
      ? `${threats.length} elevated conjunction${threats.length === 1 ? '' : 's'} require operator review.`
      : 'No elevated conjunctions in the active 72-hour screening window.',
    threats,
    anomalies: elevatedRisks,
  }
}
