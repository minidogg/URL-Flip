Used template from here for guidance in making this contributing.md: https://gist.github.com/PurpleBooth/b24679402957c63ec426

# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change. 

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Setup
### Downloading via git

### Prerequisites
- Node.js. Known compatible versions:
    - v20.18.0
- NPM. Known compatible versions: 
    - 10.8.2

### Installing packages
Run ```npm i``` to install the dependencies.  
This shouldn't take very long as there are only 2 main packages excluding the dependency dependencies.

### Running for development
Running it for development is as simple as running ```npm run dev```

### Running production
Running it for development is a little more complicated.
To run for production you will have to install pm2 by running the following: ```npm i pm2 -g```.  
Once pm2 is done installing it is as simple as running ```npm run prod```
If you need to stop pm2 you can run ```npm run prod-stop``` 

### Port
The default port is port 3000.

## Standards
All code written should follow the following rules:
- No client-side JavaScript should be required for the front end to function.
- Try to keep code organized and as isolated as possible.
- Don't rely on cookies for any kind of security.

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a 
   build.
2. Update any docs that may be affected by your changes. For example, changing 
3. Increase the version numbers in any files referencing it and the README.md to the new version that this
   Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. Let anyone who you are aware of currently working of your changes. This way they can be ready for the changes.

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at [http://contributor-covenant.org/version/1/4][version]

[homepage]: http://contributor-covenant.org
[version]: http://contributor-covenant.org/version/1/4/