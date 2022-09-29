# Why all theeses interfaces

We have 2 use cases for all theeses interfaces.

- We use interfaces to manage `specs.json` files in NusterTurbineMachine. theeses files are used to build machine configuration from a file.

- The underlying Websocket connection between `NusterTurbine` and `NusterDesktop` are strongly type to prevent displaying erroneous data.

Theeses interfaces tends to make the workflow better.
