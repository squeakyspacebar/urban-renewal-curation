<template>
    <div class="parcel-map">
        <v-card class="year-control-bar" ref="year-control-bar">
            <v-container fill-height>
                <v-layout row wrap align-center align-content-space-between>
                    <v-flex class="text-center" shrink>
                        <v-icon @click="decrementYear">
                            {{ mdiMinus }}
                        </v-icon>
                    </v-flex>
                    <v-flex class="text-center" grow>
                        <v-slider
                            v-model="selectedYear"
                            dense
                            hide-details
                            :max="maxYear"
                            :min="minYear"
                        >
                        </v-slider>
                    </v-flex>
                    <v-flex class="text-center" shrink>
                        <v-icon @click="incrementYear">
                            {{ mdiPlus }}
                        </v-icon>
                    </v-flex>
                    <v-flex class="text-center" shrink>
                        <v-divider style="display: inline" vertical />
                        <span class="year-indicator">
                            {{ selectedYear }}
                        </span>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
    </div>
</template>
<script src="./parcel-map.js"></script>
