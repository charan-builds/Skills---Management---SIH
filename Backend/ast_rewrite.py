import ast

with open('app/firebase/repository.py', 'r') as f:
    source = f.read()

tree = ast.parse(source)

class DemoModeRemover(ast.NodeTransformer):
    def visit_ClassDef(self, node):
        if node.name == 'FirestoreRepository':
            # Remove _demo_data_cache assignment
            node.body = [n for n in node.body if not (isinstance(n, ast.Assign) and any(t.id == '_demo_data_cache' for t in n.targets if isinstance(t, ast.Name)))]
            
            # Remove _load_local_demo_data method
            node.body = [n for n in node.body if not (isinstance(n, ast.FunctionDef) and n.name == '_load_local_demo_data')]
        self.generic_visit(node)
        return node

    def visit_If(self, node):
        # We need to recursively visit first
        self.generic_visit(node)
        
        # Check if this If node is checking ENABLE_DEMO_MODE
        is_demo_check = False
        if isinstance(node.test, ast.Attribute):
            if node.test.attr == 'ENABLE_DEMO_MODE':
                is_demo_check = True
                
        if is_demo_check:
            # We want to remove this If block and replace it with its orelse block, 
            # if it's an elif (which in AST is just the orelse of another If).
            # Wait, if there's no orelse, we just remove the block.
            if node.orelse:
                # But wait! The `orelse` might contain `if db:`
                # We can't just return `node.orelse` because if the If block is inside a list of statements, 
                # we should unpack the orelse statements into the parent list.
                # Since AST NodeTransformers replace a statement with a list of statements if they return a list:
                return node.orelse
            else:
                return []
                
        return node

transformer = DemoModeRemover()
new_tree = transformer.visit(tree)
ast.fix_missing_locations(new_tree)

new_source = ast.unparse(new_tree)

with open('app/firebase/repository.py', 'w') as f:
    f.write(new_source)

print("AST Rewrite successful!")
