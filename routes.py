def init_routes(app):

    @app.route('/')
    def index():
        return

    @app.route('/ws-token', methods=['POST'])
    def ws_token():
        if "logged in":
            return "randomly generated one-time token"
        else:
            return "response", 401

    @app.route('/join/<room_key>')
    def join_room(room_key):
        if "room_key is valid":
            if not "logged in":
                "create and log in as a new user"
            "link room to user"
            "delete room_key"
            "redirect to room"
        return

    @app.route('/rooms', methods=['POST'])
    def create_room():
        if "logged in":
            
        else:
            "create only the host user"
        return

    @app.route('/rooms/<room_id>')
    def show_room(room_id):
        return

    @sockets.route('/ws')
    def connection(ws):
        while not ws.closed:
            # Sleep to prevent *contstant* context-switches.
            gevent.sleep(0.0167)
            message = ws.receive()
            if message:
                if "user is logged in":
                if "message has valid credentials":
                    "log user in" # we also can find out what room this connection is for by information
                    # in the db associated with the credentials
