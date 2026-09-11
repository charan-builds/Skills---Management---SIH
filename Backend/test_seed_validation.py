import sys
import copy
from seed_phase2h_demo import generate_documents, recursive_check, validate_relationships

def test_negative_cases():
    base_docs = generate_documents()
    
    # A. Remove is_synthetic
    doc_a = copy.deepcopy(base_docs["skill_master"][0])
    del doc_a["is_synthetic"]
    ok_a, msg_a = recursive_check(doc_a, True, True)
    assert not ok_a, "Test A Failed: Should have rejected missing is_synthetic"
    
    # B. Set is_synthetic=false
    doc_b = copy.deepcopy(base_docs["skill_master"][0])
    doc_b["is_synthetic"] = False
    ok_b, msg_b = recursive_check(doc_b, True, True)
    assert not ok_b, "Test B Failed: Should have rejected is_synthetic=False"
    
    # C. Add forbidden key: "match"
    doc_c = copy.deepcopy(base_docs["trainees"][0])
    doc_c["match"] = 95
    ok_c, msg_c = recursive_check(doc_c, True, True)
    assert not ok_c, "Test C Failed: Should have rejected 'match'"
    
    # D. Add forbidden key: "application"
    doc_d = copy.deepcopy(base_docs["trainees"][0])
    doc_d["application_status"] = "PENDING"
    ok_d, msg_d = recursive_check(doc_d, True, True)
    assert not ok_d, "Test D Failed: Should have rejected 'application'"
    
    # E. Add forbidden key: "vacancy"
    doc_e = copy.deepcopy(base_docs["employers"][0])
    doc_e["vacancy_count"] = 5
    ok_e, msg_e = recursive_check(doc_e, True, True)
    assert not ok_e, "Test E Failed: Should have rejected 'vacancy'"
    
    # F. Break target_role_id
    docs_f = copy.deepcopy(base_docs)
    docs_f["trainees"][0]["target_role_id"] = "BENCH-NONEXISTENT"
    ok_f, msg_f = validate_relationships(docs_f)
    assert not ok_f, "Test F Failed: Should have rejected missing target_role_id"
    
    # G. Break programme_id
    docs_g = copy.deepcopy(base_docs)
    docs_g["trainees"][0]["programme_id"] = "PROG-NONEXISTENT"
    ok_g, msg_g = validate_relationships(docs_g)
    assert not ok_g, "Test G Failed: Should have rejected missing programme_id"
    
    # H. Break skill_id
    docs_h = copy.deepcopy(base_docs)
    docs_h["role_benchmarks"][0]["skills_required"][0]["skill_id"] = "SK-NONEXISTENT"
    ok_h, msg_h = validate_relationships(docs_h)
    assert not ok_h, "Test H Failed: Should have rejected missing skill_id"
    
    print("All negative in-memory validation tests passed correctly (rejected invalid data).")

if __name__ == "__main__":
    test_negative_cases()
