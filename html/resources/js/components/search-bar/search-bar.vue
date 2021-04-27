<template>
    <v-toolbar class="app-bar" :collapse="collapsed" dense flat>
        <v-btn @click="toggleDrawer" icon>
            <v-icon>{{ mdiChartTree }}</v-icon>
            <span class="d-sr-only">Toggle chart sidebar</span>
        </v-btn>
        <v-autocomplete
            v-model="selectedParcel"
            v-if="!collapsed"
            :loading="isLoading"
            :items="items"
            :search-input.sync="searchQuery"
            clearable
            dense
            hide-details
            hide-no-data
            item-text="label"
            no-filter
            placeholder="Search by street or owner name"
            return-object
            single-line
        >
        </v-autocomplete>
        <v-btn icon @click="toggleSearch">
            <v-icon v-if="!collapsed">{{ mdiArrowCollapseLeft }}</v-icon>
            <span v-if="!collapsed" class="d-sr-only">Collapse search bar</span>
            <v-icon v-else>{{ mdiArrowExpandRight }}</v-icon>
            <span class="d-sr-only">Expand search bar</span>
        </v-btn>
    </v-toolbar>
</template>
<script src="./search-bar.js"></script>
