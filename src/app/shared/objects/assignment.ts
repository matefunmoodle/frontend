
export class Config {
	plugin: string;
	subtype: string;
	name: string;
    value: string;
    
    constructor (conf: any){
        this.plugin = conf.plugin;
        this.subtype = conf.subtype;
        this.name = conf.name;
        this.value = conf.value;
    }
}

export class Assignment {
    id: number;
    course: number;
    name: string;
    duedate: number;
    allowsubmissionsfromdate: number;
    grade: number;
    timemodified: number;
    cutoffdate: number;
    gradingduedate: number;
    completionsubmit: number;
    teamsubmission: number;
    requireallteammemberssubmit: number;
    maxattempts: number;
    
    configs: Config[];

    constructor (ass: any){
        this.id = ass.id;
        this.course = ass.course;
        this.name = ass.name;
        this.duedate = ass.duedate;
        this.allowsubmissionsfromdate = ass.allowsubmissionsfromdate;
        this.grade = ass.grade;
        this.timemodified = ass.timemodified;
        this.cutoffdate = ass.cutoffdate;
        this.gradingduedate = ass.gradingduedate;
        this.completionsubmit = ass.completionsubmit;
        this.teamsubmission = ass.teamsubmission;
        this.requireallteammemberssubmit = ass.requireallteammemberssubmit;
        this.maxattempts = ass.maxattempts;
        
        this.configs = !ass.configs ? [] : ass.configs.map (c => new Config(c));
    }

}