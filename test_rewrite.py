import urllib.request
import json
import traceback

def test():
    for recipient in ['priyanshu', 'granth']:
        print(f"\n--- Testing {recipient} ---")
        req = urllib.request.Request(
            'http://localhost:8000/api/rewrite', 
            data=json.dumps({
                'recipient_id': recipient, 
                'original_draft': 'We need to get this done ASAP.', 
                'sender_id': 'leader_01'
            }).encode('utf-8'), 
            headers={'Content-Type': 'application/json'}
        )
        try:
            resp = urllib.request.urlopen(req)
            print("Status:", resp.status)
            print("Response:", json.dumps(json.loads(resp.read()), indent=2))
        except Exception as e:
            print("Error:", e)
            if hasattr(e, 'read'):
                print(e.read().decode())
            traceback.print_exc()

if __name__ == '__main__':
    test()
