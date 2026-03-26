import json

json_path = "/home/charan/Repos/mana base/imports/default-cards.json"
with open(json_path, 'r', encoding='utf-8') as f:
    content = ""
    # Skip the opening bracket '['
    f.read(1)
    
    # Read characters until we have 2 complete objects
    objects_found = 0
    buffer = ""
    brace_depth = 0
    
    while objects_found < 2:
        char = f.read(1)
        if not char:
            break
        buffer += char
        if char == '{':
            brace_depth += 1
        elif char == '}':
            brace_depth -= 1
            if brace_depth == 0:
                # We finished an object
                try:
                    obj = json.loads(buffer.strip().lstrip(','))
                    print(json.dumps(obj, indent=2))
                    print("\n" + "="*50 + "\n")
                    objects_found += 1
                    buffer = ""
                except:
                    # Might have leading comma
                    pass
