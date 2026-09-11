/**
 * Authoritative initial mock dataset for Skilling Impact Intelligence Platform.
 * Deterministically generates ~800 relational trainees linked to programmes, providers,
 * districts, employers, verifications, follow-ups, and wage history.
 */

import {
  generateRelationalDataset,
  COHORTS
} from "./generateDataset";

const generated = generateRelationalDataset(800);

export const INITIAL_PROGRAMMES = generated.programmes;
export const INITIAL_EMPLOYERS = generated.employers;
export const INITIAL_PROVIDERS = generated.providers;
export const INITIAL_DISTRICTS = generated.districts;
export const INITIAL_COHORTS = COHORTS;
export const INITIAL_TRAINEES = generated.trainees;
export const INITIAL_VERIFICATIONS = generated.verifications;
export const INITIAL_POLICY_INTERVENTIONS = generated.policy_interventions;
export const INITIAL_DEMAND_SUPPLY = generated.demand_supply;
export const INITIAL_CURRICULUM_MAPPING = generated.curriculum_mapping;
export const INITIAL_EMPLOYER_FEEDBACK = generated.employer_feedback;

export const INITIAL_INTEGRATIONS = [
  {
    id: "INT-001",
    name: "Workday HCM",
    type: "HRIS / ATS",
    status: "Connected",
    last_sync: "12 minutes ago",
    records_received: 42,
    automatically_verified: 38,
    exceptions_detected: 4,
    api_endpoint: "https://api.workday.com/ccx/service/v1/tcs_production"
  },
  {
    id: "INT-002",
    name: "BambooHR Connect",
    type: "HR System",
    status: "Connected",
    last_sync: "45 minutes ago",
    records_received: 24,
    automatically_verified: 22,
    exceptions_detected: 2,
    api_endpoint: "https://api.bamboohr.com/api/gateway.php/tcs_sub"
  },
  {
    id: "INT-003",
    name: "Darwinbox Enterprise",
    type: "Payroll & HR",
    status: "Configuration Required",
    last_sync: "Never",
    records_received: 0,
    automatically_verified: 0,
    exceptions_detected: 0,
    api_endpoint: ""
  },
  {
    id: "INT-004",
    name: "National Career Service (NCS)",
    type: "Government Exchange",
    status: "Connected",
    last_sync: "1 hour ago",
    records_received: 68,
    automatically_verified: 65,
    exceptions_detected: 3,
    api_endpoint: "https://api.ncs.gov.in/v2/institutional/exchange"
  },
  {
    id: "INT-005",
    name: "PFMS / DBT Direct Gateway",
    type: "Stipend & Disbursal",
    status: "Connected",
    last_sync: "2 hours ago",
    records_received: 120,
    automatically_verified: 118,
    exceptions_detected: 2,
    api_endpoint: "https://pfms.nic.in/api/v1/stipend/attestation"
  }
];
