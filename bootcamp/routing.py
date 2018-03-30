from channels import include

channel_routing = [
    # Include subrouting from an app with predefined path matching.
    include("bootcamp.liveuser.routing.websocket_routing",
            path=r"^/liveuser/ws/$"),
    include("bootcamp.activities.routing.websocket_routing",
            path=r"^/notifications/ws/$"),
    include("bootcamp.feeds.routing.websocket_routing", path=r"^/feeds/ws/$"),
    include("bootcamp.messenger.routing.websocket_routing",
            path=r"^/ws/"),
   
]
