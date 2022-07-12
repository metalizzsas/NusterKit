export enum EIOGateBus{
    IN = "in",
    OUT = "out"
}

export enum EIOGateSize
{
    BIT = "bit",
    WORD = "word"
}

export enum EIOGateType
{
    A10V = "a10v",
    EM4A10V = "em4a10v",
    EM4TEMP = "em4temp",
    UM18 = "um18",
    DEFAULT = "default",
}

export interface IIOGate
{
    name: EIOGateNames;

    size: EIOGateSize;
    type: EIOGateType;
    bus: EIOGateBus;

    automaton: number;
    address: number;

    default: number;

    isCritical?: boolean;
    manualModeWatchdog?: boolean;
}

export type EIOGateNames = (

    //Common names

    "emergency_stop" |
    "cover_closed" |
    "air_sensor" |
    "nitrogen_sensor" | 
    "temperature" |

    "motor-direction" |
    "motor-speed" |
    "ventilation" |
    "air_heater" |

    //Metalfog

    "levels_edi-max-n" |
    "levels_act-max-n" |
    "levels_eff-max-n" |
    "eff_container_sensor" |
    "levels_edi-min-n" |
    "levels_act-min-n" |

    "levels_ox-min-n" |
    "levels_rd-min-n" |

    "act-res" |
    "edi-res" |
    "ox-res" |
    "rd-res" |

    "hybrid-plv_high" |
    "hybrid-plv_low" |

    "met-plv_high" |
    "met-plv_medium" |
    "met-plv_low" |

    "act-lq_high" |
    "act-lq_low" |

    "edi-lq_high" |
    "edi-lq_low" |

    "rd-lq_high" |
    "ox-lq_high" |

    "rd-lq_medium" |
    "ox-lq_medium" |

    "rd-lq_low" |
    "ox-lq_low" |

    "rd-air_cleaning_high" |
    "ox-air_cleaning_high" |

    "rd-air_cleaning_medium" |
    "ox-air_cleaning_medium" |

    "rd-air_cleaning_low" | 
    "ox-air_cleaning_low" | 

    "edi-lq_fill_act" |

    //Smoothit

    "resin-slot_sensor" | 

    "nozzle-sensor_open" |
    "nozzle-sensor_closed" |

    "ir-sensor_open" |
    "ir-sensor_closed" |

    "uv-sensor_open" |
    "uv-sensor_closed" |
    "uv-overheat" |

    "nozzle-pulverization" |
    "nozzle-cache" |
    "resin-pressure" |

    "inerting" |

    "uv-enable" | 
    "uv-ventil" |
    "uv-power" |
    "uv-cache" |

    "ir-enable" |
    "ir-ventil" |
    "ir-cache" |

    //Uscleaner

    "us_power" |

    "temperature-heater" |
    "temperature-ventilation" |

    "pump"
);