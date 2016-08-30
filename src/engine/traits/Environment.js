Engine.traits.Environment =
class Environment extends Engine.Trait
{
    constructor()
    {
        super();
        this.NAME = 'environment';
        this.atmosphericDensity = 1000;
        this.timeDilation = 1;
    }
    __collides(subject)
    {
      if (subject.physics) {
          p = subject.physics;
         p.atmosphericDensity = this.atmosphericDensity;
      }

      subject.timeStretch = this.timeDilation;
    }
}
