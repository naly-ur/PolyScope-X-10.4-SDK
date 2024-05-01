# Docker Volume Management: An Overview

This README provides an understanding of various ways to handle storage in urcap container, namely Persistent Volumes, tmpfs mounts, and Removable Storage. We'll also explore the potential risks, including data loss, associated with volume mounts.

## Types of Volume Mounts

Different types of volume mounts in Docker serve distinct use cases. Each comes with its own advantages and disadvantages.

### 1. Persistent Volumes

Persistent Volumes retain data beyond the lifecycle of individual containers. Therefore, even when a container is stopped or deleted, the data in the persistent volume remains intact. This preservation of data applies even during urcap updates/upgrades. These volumes are particularly useful when you need to preserve data across container restarts, which is common with long-term data like database files and application logs. Typically, this type of storage resides on the host filesystem.

### 2. tmpfs mounts

In contrast to Persistent Volumes, tmpfs mounts are temporary filesystems residing in memory or the host's swap space. All content in tmpfs is cleared when the container stops, leading to high-speed but non-persistent storage. tmpfs mounts are ideal for storing sensitive information that should not be written to disk or temporary data that doesn't need to persist. However, note that data in tmpfs mounts is lost during urcap updates/upgrades.

### 3. Removable Storage

Removable storage generally refers to physical storage devices like USB drives, external hard drives, or SD cards. Direct use of removable storage with Docker is less common because Docker performs best with consistently available storage. However, you can technically use removable storage with Docker if the storage is present and mounted on the host system. This mounted directory can then serve as a Docker volume.

## Risk of Data Loss with Volume Mounts

Regardless of the volume mount type (Persistent, tmpfs, or Removable Storage), data loss can occur when a volume is mounted onto an existing directory in a Docker container.

When a volume mount "covers" a directory with pre-existing data, the data becomes obscured and inaccessible for the duration of the mount. It's crucial to note that this doesn't result in permanent data deletion or loss, but from the perspective of applications running inside the container, it seems as though the data has been lost.

To avoid obscuring crucial data, ensure that the target directory for volume mounts is specifically designed for this purpose and does not contain data required while the volume is mounted.
