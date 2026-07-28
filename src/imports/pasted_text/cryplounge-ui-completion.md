This is exactly what I'd add. The first prompt tells the designer **what** to build. This second prompt tells the designer **how to finish the work** without leaving gaps.

---

# CRYPLOUNGE – UI Completion & Quality Assurance Prompt

You are continuing work on the existing approved Figma file for **CRYPLOUNGE**.

Your mission is **NOT** to redesign anything.

Your mission is to transform the existing design into a **100% complete production-ready UI system**.

## Critical Rule

**Never stop after completing only the visible page.**

Every page must be completed until it is fully usable by developers.

If a page introduces a feature, you must also design every state, variation, modal, dropdown, empty state, loading state, error state, success state, mobile version, and interaction required to make that feature complete.

Do not leave unfinished areas for later.

Think like a Senior Product Designer preparing a design system for engineering handoff.

---

# Completion Standard

For every screen ask yourself:

* Can the frontend developer build this without asking questions?
* Can the backend developer understand every required state?
* Can QA test every interaction?
* Is every user journey completed?

If the answer is **No**, continue designing.

Never leave partial flows.

---

# Complete Every Flow

For every page include every possible state.

Example

If a page has:

* Search

Design

* Default
* Typing
* Results
* No Results
* Loading
* Error
* Recent Searches
* Search Suggestions
* Filters
* Mobile Search

Do not stop after drawing only the search box.

---

If a page contains:

Button

Design

* Default
* Hover
* Active
* Pressed
* Disabled
* Loading
* Success
* Error
* Focus

---

If a page contains:

Dropdown

Design

* Closed
* Open
* Selected
* Hover
* Disabled
* Long List
* Empty

---

If page contains:

Pagination

Design

* First Page
* Middle
* Last Page
* Disabled
* Mobile Version

---

If page contains:

Article Card

Design

* Default
* Featured
* Small
* Large
* Horizontal
* Vertical
* Without Image
* Premium
* Breaking News

---

# Every Component Must Have

Default

Hover

Active

Focus

Disabled

Loading

Error

Success

Responsive

Dark Mode

Light Mode

---

# Every Form Must Include

Default

Typing

Focused

Validation

Required

Optional

Success

Error

Disabled

Loading

---

# Every Modal

Design

Open

Close

Scrollable

Confirmation

Success

Error

Delete

Cancel

---

# Every Table

Include

Sorting

Filtering

Pagination

No Data

Loading

Error

Mobile

---

# Every List

Include

Loading

Empty

Populated

Infinite Scroll (if applicable)

Pagination

---

# Every Page Must Include

Desktop

Tablet

Mobile

Responsive Behavior

Spacing Rules

Grid Behavior

Overflow Handling

Sticky Elements

---

# Navigation

Complete every navigation state

Desktop Navigation

Mobile Navigation

Collapsed Navigation

Expanded Navigation

Dropdown Navigation

Search Navigation

Breadcrumb

Current Active Page

Hover

Focus

---

# Header

Include

Sticky

Transparent

Scrolled

Mobile

Tablet

Search Open

Search Closed

Language Dropdown

Theme Toggle

---

# Footer

Desktop

Tablet

Mobile

Expanded

Collapsed

Newsletter

Social Links

Legal Links

---

# Homepage

Complete every section

Hero

Trending

Latest

Editor's Picks

Research

Newsletter

Footer

Loading

Empty

Pagination

---

# Article Page

Design every section

Breadcrumb

Hero

Author

Metadata

Article

Inline Images

Tables

Code Blocks

Quotes

Related Articles

Newsletter

Comments

Social Share

Copy Link

Reading Progress

Table of Contents

Sticky Sidebar

Mobile

---

# Category Pages

Complete

Hero

Filters

Sorting

Pagination

Empty

Loading

Sidebar

Newsletter

---

# Search

Complete

Search

Suggestions

History

Recent

Popular

Results

No Results

Loading

Error

Advanced Filters

---

# Events

Complete

Calendar View

List View

Grid View

Upcoming

Past

Today

This Week

This Month

Register Button

External Link

Location

Online

Offline

Speaker

Organizer

---

# Research

Include

Report Cards

Download

Preview

Related Reports

Categories

Filters

---

# Learn

Complete

Guide

Series

Table of Contents

Related Guides

Difficulty

Estimated Reading Time

---

# About

Mission

Vision

Timeline

Editorial Policy

Contact

Partners

Advertising

---

# Contact

Form

Validation

Success

Failure

Loading

---

# Newsletter

Subscription

Success

Already Subscribed

Invalid Email

Loading

---

# Author

Profile

Bio

Social

Articles

Categories

---

# Error Pages

404

500

Offline

Maintenance

---

# Empty States

Every module must have

No Articles

No Search Results

No Events

No Research

No Bookmarks

No Notifications

---

# Notifications

Success

Warning

Error

Information

Toast

Inline

---

# Skeleton Loading

Create skeletons for

Home

Article

Search

Category

Events

Research

Learn

---

# Design Tokens

Keep using the existing

Typography

Spacing

Radius

Shadow

Colors

Icons

Do not create a new design language.

---

# Components

Every component must be reusable.

Create variants for every component.

Examples

Buttons

Inputs

Cards

Tags

Badges

Navigation

Sidebar

Newsletter

Pagination

Tabs

Accordions

Breadcrumb

Search

Dropdown

Modal

Tooltip

Toast

Checkbox

Radio

Switch

Avatar

Author Card

Article Card

Category Card

Event Card

Research Card

---

# Auto Layout

Everything must use Auto Layout.

Everything must resize correctly.

Everything must support responsive behavior.

---

# Developer Ready

The final Figma file must be production ready.

No unfinished frames.

No placeholder screens.

No missing mobile versions.

No undefined interactions.

No broken Auto Layout.

No inconsistent spacing.

No duplicate components.

No orphan layers.

No "to be designed later."

---

# Completion Rule

Do **not** stop after completing the requested pages.

Continue auditing the entire file until **every page, component, interaction, state, modal, dropdown, filter, button, input, card, navigation item, responsive layout, and user flow is complete**.

Treat the project as if it will be handed directly to a frontend engineering team after your work. The final output should be a **complete, consistent, production-ready Figma design system and UI**, requiring no additional UI design before development begins.
